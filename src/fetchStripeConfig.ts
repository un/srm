import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

interface FetchedProduct {
  name: string;
  id: string;
  prices: {
    [key: string]: {
      amount: number;
      interval: Stripe.Price.Recurring.Interval;
    };
  };
  features: string[]; // Adjust as needed
}

async function fetchProducts(): Promise<FetchedProduct[]> {
  const products: FetchedProduct[] = [];
  let hasMore = true;
  let startingAfter: string | undefined = undefined;

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

      const priceData: { [key: string]: { amount: number; interval: Stripe.Price.Recurring.Interval } } = {};

      for (const price of prices.data) {
        if (price.recurring) {
          priceData[price.nickname || price.id] = {
            amount: price.unit_amount!,
            interval: price.recurring.interval,
          };
        }
      }

      // Placeholder for features, adjust based on your metadata or another source
      const features: string[] = product.metadata.features
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

function generateConfigFile(products: FetchedProduct[]) {
  const config = {
    features: {
      basicAnalytics: 'Basic Analytics',
      aiReporting: 'AI Reporting',
      // Add other features as needed
    },
    products: {} as Record<string, any>,
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

  fs.writeFileSync(path.resolve(__dirname, '../examples/srm.config.ts'), configContent, 'utf-8');
  console.log('srm.config.ts has been generated successfully.');
}

(async () => {
  try {
    const products = await fetchProducts();
    generateConfigFile(products);
  } catch (error) {
    console.error('Error fetching products from Stripe:', error);
  }
})();