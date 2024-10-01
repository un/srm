"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = pull;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const stripe_1 = __importDefault(require("stripe"));
async function pull(configPath = 'srm.config.ts', envFilePath = '.env') {
    console.error('Starting pull process...'); // Use console.error for logging
    // Check if the .env file exists before loading
    if (fs_1.default.existsSync(envFilePath)) {
        dotenv_1.default.config({ path: envFilePath });
        console.error('Environment variables loaded from:', envFilePath);
    }
    else {
        console.error(`Environment file not found: ${envFilePath}`);
        console.error('Proceeding without loading environment variables.');
    }
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
    }
    const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    try {
        const products = await fetchProducts(stripe);
        const configString = generateConfigString(products);
        // Output the configuration to stdout
        console.log(configString);
        console.error('Configuration pulled from Stripe and output to stdout');
    }
    catch (error) {
        console.error('Error pulling configuration from Stripe:', error);
        throw error;
    }
}
async function fetchProducts(stripe) {
    const products = await stripe.products.list({ active: true, expand: ['data.default_price'] });
    return Promise.all(products.data.map(async (product) => {
        const prices = await stripe.prices.list({ product: product.id });
        return {
            id: product.id,
            name: product.name,
            taxCode: product.tax_code,
            prices: prices.data.map(price => {
                var _a;
                return ({
                    id: price.id,
                    amount: price.unit_amount,
                    interval: price.type === 'recurring' ? ((_a = price.recurring) === null || _a === void 0 ? void 0 : _a.interval) || null : null,
                    type: price.type,
                });
            })
        };
    }));
}
function generateConfigString(products) {
    const config = {
        features: {},
        products: products.reduce((acc, product) => {
            acc[product.id] = {
                name: product.name,
                id: product.id,
                taxCategory: product.taxCode,
                prices: product.prices.reduce((priceAcc, price) => {
                    priceAcc[price.id] = {
                        amount: price.amount,
                        interval: price.interval,
                        type: price.type,
                    };
                    return priceAcc;
                }, {}),
                features: []
            };
            return acc;
        }, {})
    };
    return `import { PreSRMConfig } from "u22n/srm";
import { taxCodes } from "u22n/srm";

export const config = ${JSON.stringify(config, null, 2)} as PreSRMConfig;
`;
}
