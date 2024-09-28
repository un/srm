"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProducts = fetchProducts;
exports.generateConfigString = generateConfigString;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});
async function fetchProducts() {
    const products = [];
    let hasMore = true;
    let startingAfter = undefined;
    while (hasMore) {
        const response = await stripe.products.list({
            limit: 100,
            starting_after: startingAfter,
        });
        for (const product of response.data) {
            // Fetch prices for each product
            const prices = await stripe.prices.list({
                product: product.id,
                limit: 100,
            });
            const priceData = {};
            for (const price of prices.data) {
                if (price.recurring) {
                    priceData[price.nickname || price.id] = {
                        amount: price.unit_amount,
                        interval: price.recurring.interval,
                    };
                }
            }
            // Placeholder for features, adjust based on your metadata or another source
            const features = product.metadata.features
                ? product.metadata.features.split(',')
                : [];
            products.push({
                name: product.name,
                id: product.metadata.srm_product_key || product.id,
                prices: priceData,
                features,
            });
        }
        hasMore = response.has_more;
        if (hasMore) {
            startingAfter = response.data[response.data.length - 1].id;
        }
    }
    return products;
}
function generateConfigString(products) {
    const config = {
        features: {
            basicAnalytics: 'Basic Analytics',
            aiReporting: 'AI Reporting',
            // Add other features as needed
        },
        products: {},
    };
    for (const product of products) {
        config.products[product.id] = {
            name: product.name,
            id: product.id,
            prices: {},
            features: product.features,
        };
        for (const [priceKey, price] of Object.entries(product.prices)) {
            config.products[product.id].prices[priceKey] = {
                amount: price.amount,
                interval: price.interval,
            };
        }
    }
    const configContent = `import { SRMConfig } from "../src/types";

export const config: SRMConfig = ${JSON.stringify(config, null, 2)} as const;

export default config;
`;
    return configContent;
}
