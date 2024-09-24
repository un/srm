import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { SRMConfig } from './types';

// Load environment variables from .env file

export async function deploy(configPath: string = 'srm.config.ts', envFilePath: string = '.env'): Promise<void> {
  console.log('Starting deployment process...');
  
  // Check if the .env file exists before loading
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.log('Environment variables loaded from:', envFilePath);
  } else {
    console.warn(`Environment file not found: ${envFilePath}`);
    console.warn('Proceeding without loading environment variables.');
  }

  // Resolve the config path relative to the current working directory
  const resolvedConfigPath = path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(resolvedConfigPath)) {
    throw new Error(`Configuration file not found: ${resolvedConfigPath}`);
  }

  // Import the configuration using the resolved path
  const config: SRMConfig = require(resolvedConfigPath).default;

  // Initialize Stripe with your secret key
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not found. Set STRIPE_SECRET_KEY in your environment variables or .env file.');
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

  console.log('Deploying configuration to Stripe...');

  // Initialize the mapping object
  const priceIdMapping: Record<string, any> = {};

  // Sync products and prices, collecting IDs into priceIdMapping
  await syncProductsAndPrices(stripe, config, priceIdMapping);

  // Generate price-id-mapping.json file
  generatePriceIdMapping(priceIdMapping);

  console.log('Configuration deployed successfully.');
}

// Add this new function at the end of the file
function generatePriceIdMapping(priceIdMapping: Record<string, any>): void {
  const mappingPath = path.join(process.cwd(), 'price-id-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(priceIdMapping, null, 2));
  console.log('Price ID mapping saved to:', mappingPath);
}

async function syncProductsAndPrices(
  stripe: Stripe,
  config: SRMConfig,
  priceIdMapping: Record<string, any>
): Promise<void> {
  console.log('Synchronizing products and prices...');
  
  const { products } = config;
  console.log('Products to synchronize:', products);

  for (const productKey in products) {
    const productConfig = products[productKey];
    console.log(`Processing product: ${productKey}`, productConfig);

    // Check if product already exists
    const existingProducts = await stripe.products.list({ limit: 100 });
    console.log(`Fetched existing products: ${existingProducts.data.length}`);

    let product = existingProducts.data.find((p) => p.metadata.srm_product_key === productKey);

    if (!product) {
      // Create new product
      product = await stripe.products.create({
        name: productConfig.name,
        metadata: {
          srm_product_key: productKey,
        },
      });
      console.log(`Created product: ${product.name}`);
    } else {
      // Update existing product if necessary
      product = await stripe.products.update(product.id, {
        name: productConfig.name,
      });
      console.log(`Updated product: ${product.name}`);
    }

    // Initialize the product entry in the mapping
    priceIdMapping[productKey] = {
      productId: product.id,
      prices: {},
    };

    // Sync prices
    await syncPrices(stripe, product, productConfig.prices, priceIdMapping, productKey);
  }
  console.log('All products synchronized.');
}

async function syncPrices(
  stripe: Stripe,
  product: Stripe.Product,
  pricesConfig: { [key: string]: { amount: number; interval: string } },
  priceIdMapping: Record<string, any>,
  productKey: string
): Promise<void> {
  console.log(`Synchronizing prices for product: ${product.name}`);
  
  for (const priceKey in pricesConfig) {
    const priceConfig = pricesConfig[priceKey];
    console.log(`Processing price: ${priceKey}`, priceConfig);

    // Check if price already exists
    const existingPrices = await stripe.prices.list({
      product: product.id,
      limit: 100,
    });
    console.log(`Fetched existing prices: ${existingPrices.data.length}`);

    let price = existingPrices.data.find(
      (p) =>
        p.metadata.srm_price_key === priceKey &&
        p.unit_amount === priceConfig.amount &&
        p.recurring?.interval === priceConfig.interval
    );

    if (!price) {
      // Create new price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceConfig.amount,
        currency: 'usd', // Adjust the currency as needed
        recurring: {
          interval: priceConfig.interval as Stripe.Price.Recurring.Interval,
        },
        metadata: {
          srm_price_key: priceKey,
        },
      });
      console.log(`Created price for product ${product.name}: $${priceConfig.amount / 100}/${priceConfig.interval}`);
    } else {
      console.log(`Price for product ${product.name} already exists: $${priceConfig.amount / 100}/${priceConfig.interval}`);
    }

    // Add the price ID to the mapping
    priceIdMapping[productKey].prices[priceKey] = price.id;
  }
  console.log(`All prices synchronized for product: ${product.name}`);
}
