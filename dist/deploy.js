"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = deploy;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const tsNode = __importStar(require("ts-node"));
const tax_codes_1 = require("./tax-codes");
// Load environment variables from .env file
async function deploy(configPath = "srm.config.ts", envFilePath = ".env") {
    console.log("Starting deployment process...");
    // Check if the .env file exists before loading
    if (fs_1.default.existsSync(envFilePath)) {
        dotenv_1.default.config({ path: envFilePath });
        console.log("Environment variables loaded from:", envFilePath);
    }
    else {
        console.warn(`Environment file not found: ${envFilePath}`);
        console.warn("Proceeding without loading environment variables.");
    }
    // Resolve the config path relative to the current working directory
    const resolvedConfigPath = path_1.default.resolve(process.cwd(), configPath);
    if (!fs_1.default.existsSync(resolvedConfigPath)) {
        throw new Error(`Configuration file not found: ${resolvedConfigPath}`);
    }
    // Register ts-node to handle TypeScript files
    tsNode.register({
        compilerOptions: {
            module: 'commonjs',
        },
    });
    // Import the configuration using the resolved path
    const { config } = await Promise.resolve(`${resolvedConfigPath}`).then(s => __importStar(require(s)));
    // Initialize Stripe with your secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        throw new Error("Stripe secret key not found. Set STRIPE_SECRET_KEY in your environment variables or .env file.");
    }
    const stripe = new stripe_1.default(stripeSecretKey, { apiVersion: "2024-06-20" });
    console.log("Deploying configuration to Stripe...");
    // Initialize the mapping object
    const priceIdMapping = {};
    // Sync products and prices, collecting IDs into priceIdMapping
    await syncProductsAndPrices(stripe, config, priceIdMapping);
    // Deploy webhooks
    if (config.webhooks) {
        await deployWebhooks(stripe, config.webhooks);
    }
    console.log("Configuration deployed successfully.");
}
// Add this new function at the end of the file
async function syncProductsAndPrices(stripe, config, priceIdMapping) {
    console.log("Synchronizing products and prices...");
    const { products } = config;
    console.log("Products to synchronize:", products);
    for (const productKey in products) {
        const productConfig = products[productKey];
        console.log(`Processing product: ${productKey}`, productConfig);
        // Check if product already exists
        const existingProducts = await stripe.products.list({ limit: 100 });
        console.log(`Fetched existing products: ${existingProducts.data.length}`);
        let product = existingProducts.data.find((p) => p.metadata.srm_product_key === productKey);
        const productData = {
            name: productConfig.name,
            metadata: {
                srm_product_key: productKey,
            },
            tax_code: productConfig.taxCode || tax_codes_1.taxCodes.DEFAULT, // Use default if not provided
        };
        if (!product) {
            // Create new product
            product = await stripe.products.create(productData);
            console.log(`Created product: ${product.name} with tax code: ${product.tax_code}`);
        }
        else {
            // Update existing product if necessary
            product = await stripe.products.update(product.id, productData);
            console.log(`Updated product: ${product.name} with tax code: ${product.tax_code}`);
        }
        // Initialize the product entry in the mapping
        priceIdMapping[productKey] = {
            productId: product.id,
            prices: {},
        };
        // Sync prices
        await syncPrices(stripe, product, productConfig.prices, priceIdMapping, productKey);
    }
    console.log("All products synchronized.");
}
async function syncPrices(stripe, product, pricesConfig, priceIdMapping, productKey) {
    console.log(`Synchronizing prices for product: ${product.name}`);
    for (const priceKey in pricesConfig) {
        const priceConfig = pricesConfig[priceKey];
        // Set default tax code if not provided
        // Check if price already exists
        const existingPrices = await stripe.prices.list({
            product: product.id,
            limit: 100,
        });
        console.log(`Fetched existing prices: ${existingPrices.data.length}`);
        let price = existingPrices.data.find((p) => {
            var _a;
            const matchesKey = p.metadata.srm_price_key === priceKey;
            const matchesAmount = p.unit_amount === priceConfig.amount;
            const matchesInterval = priceConfig.type === "recurring"
                ? ((_a = p.recurring) === null || _a === void 0 ? void 0 : _a.interval) === priceConfig.interval
                : !p.recurring;
            const matchesType = p.recurring ? "recurring" : "one_time";
            return matchesKey && matchesAmount && matchesInterval && matchesType === priceConfig.type;
        });
        if (!price) {
            // Create new price based on type
            const priceParams = {
                product: product.id,
                unit_amount: priceConfig.amount,
                currency: "usd", // Adjust the currency as needed
                metadata: {
                    srm_price_key: priceKey,
                    ...(priceConfig.trialPeriodDays && { trial_period_days: priceConfig.trialPeriodDays.toString() }),
                },
                tax_behavior: 'exclusive',
            };
            if (priceConfig.type === "recurring") {
                priceParams.recurring = {
                    interval: priceConfig.interval,
                };
            }
            price = await stripe.prices.create(priceParams);
            console.log(`Created price for product ${product.name}: $${priceConfig.amount / 100}/${priceConfig.type === "recurring" ? priceConfig.interval : "one-time"}${priceConfig.trialPeriodDays ? ` with ${priceConfig.trialPeriodDays}-day trial` : ''}`);
        }
        else {
            console.log(`Price for product ${product.name} already exists: $${priceConfig.amount / 100}/${priceConfig.type === "recurring" ? priceConfig.interval : "one-time"}`);
        }
        // Add the price ID to the mapping
        priceIdMapping[productKey].prices[priceKey] = price.id;
    }
    console.log(`All prices synchronized for product: ${product.name}`);
}
async function deployWebhooks(stripe, webhooksConfig) {
    if (!webhooksConfig) {
        console.warn("No webhooks configured in the config file.");
        return;
    }
    console.log("Deploying webhooks...");
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const existingEndpoint = existingWebhooks.data.find(wh => wh.url === webhooksConfig.endpoint);
    if (!existingEndpoint) {
        await stripe.webhookEndpoints.create({
            url: webhooksConfig.endpoint,
            enabled_events: webhooksConfig.events,
            api_version: '2024-06-20',
        });
        console.log(`Created new webhook endpoint: ${webhooksConfig.endpoint}`);
    }
    else {
        await stripe.webhookEndpoints.update(existingEndpoint.id, {
            enabled_events: webhooksConfig.events,
        });
        console.log(`Updated existing webhook endpoint: ${webhooksConfig.endpoint}`);
    }
}
