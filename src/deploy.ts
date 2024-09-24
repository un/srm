import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { SRMConfig, ProductConfig, PriceConfig } from './types';

// Load environment variables from .env file

export async function deploy(configPath: string = 'srm.config.ts', envFilePath: string = '.env') {
  console.log('Starting deployment process...');
  
  // Check if the .env file exists before loading
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.log('Environment variables loaded from:', envFilePath);
  } else {
    console.warn(`Environment file not found: ${envFilePath}`);
    console.warn('Proceeding without loading environment variables.');
  }

  console.log('Resolved configuration path:', configPath);

  if (!fs.existsSync(configPath)) {
    console.error('Configuration file not found.');
    process.exit(1);
  }
  console.log('Configuration file found.');

  // Import the configuration
  const config: SRMConfig = require(configPath).default;
  console.log('Configuration imported:', config);

  // Initialize Stripe with your secret key
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error('Stripe secret key not found. Set STRIPE_SECRET_KEY in your environment variables or .env file.');
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
  console.log('Stripe client initialized.');

  console.log('Deploying configuration to Stripe...');

  // Sync products and prices
  await syncProductsAndPrices(stripe, config);
  
  console.log('Configuration deployed successfully.');
}

async function syncProductsAndPrices(stripe: Stripe, config: SRMConfig) {
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
    if (product) {
      console.log(`Existing product found: ${product.name}`);
    } else {
      console.log(`No existing product found for key: ${productKey}`);
    }

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

    // Sync prices
    await syncPrices(stripe, product, productConfig.prices);
  }
  console.log('All products synchronized.');
}

async function syncPrices(stripe: Stripe, product: Stripe.Product, pricesConfig: { [key: string]: PriceConfig }) {
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

    if (price && price.unit_amount && price.recurring?.interval) {
      console.log(`Existing price found: ${price.unit_amount / 100}/${price.recurring?.interval}`);
    } else {
      console.log(`No existing price found for key: ${priceKey}`);
    }

    if (!price) {
      // Create new price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceConfig.amount,
        currency: 'usd', // Adjust the currency as needed
        recurring: {
          interval: priceConfig.interval,
        },
        metadata: {
          srm_price_key: priceKey,
        },
      });
      console.log(`Created price for product ${product.name}: $${priceConfig.amount / 100}/${priceConfig.interval}`);
    } else {
      console.log(`Price for product ${product.name} already exists: $${priceConfig.amount / 100}/${priceConfig.interval}`);
    }
  }
  console.log(`All prices synchronized for product: ${product.name}`);
}

deploy();