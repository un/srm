// a lot of this file should be in the src/ 

// Types
export interface SRMConfig {
  products: { [key: string]: SRMProduct };
  features: { [key: string]: string };
}

export interface SRMProduct {
  name: string;
  prices: { [key: string]: SRMPrice };
  features: string[];
}

export interface SRMPrice {
  amount: number;
  interval: 'day' | 'week' | 'month' | 'year';
}

// Enhanced Types
interface EnhancedSRMPrice extends SRMPrice {
  createSubscriptionCheckoutUrl: (params: { userId: string }) => Promise<string>;
}

interface EnhancedSRMProduct extends SRMProduct {
  prices: { [key: string]: EnhancedSRMPrice };
}

interface EnhancedSRMConfig extends SRMConfig {
  products: { [key: string]: EnhancedSRMProduct };
}

import { createSubscriptionCheckoutUrl } from '../src/create-checkout';

const defineConfig = (config: SRMConfig): EnhancedSRMConfig => {
  console.log('Starting defineConfig');
  console.log('Input config:', JSON.stringify(config, null, 2));

  const enhancedProducts: { [key: string]: EnhancedSRMProduct } = {};

  for (const productKey in config.products) {
    console.log(`Processing product: ${productKey}`);
    if (Object.prototype.hasOwnProperty.call(config.products, productKey)) {
      const product = config.products[productKey];
      console.log('Original product:', JSON.stringify(product, null, 2));

      const enhancedPrices: { [key: string]: EnhancedSRMPrice } = {};

      for (const priceKey in product.prices) {
        console.log(`Processing price: ${priceKey}`);
        if (Object.prototype.hasOwnProperty.call(product.prices, priceKey)) {
          const price = product.prices[priceKey];
          console.log('Original price:', JSON.stringify(price, null, 2));

          enhancedPrices[priceKey] = {
            ...price,
            createSubscriptionCheckoutUrl: async (params: { userId: string }) => {
              console.log(`Creating checkout URL for ${productKey}:${priceKey}`);
              const url = await createSubscriptionCheckoutUrl({
                userId: params.userId,
                productKey,
                priceKey,
              });
              console.log('Generated URL:', url);
              return url;
            },
          };
        }
      }

      enhancedProducts[productKey] = {
        ...product,
        prices: enhancedPrices,
      };
    }
  }

  const enhancedConfig = {
    ...config,
    products: enhancedProducts,
  };
  return enhancedConfig;
};

const config: SRMConfig = {
  features: {
    basicAnalytics: 'Basic Analytics',
    aiReporting: 'AI Reporting',
  },
  products: {
    hobby: {
      name: 'Hobby Plan',
      prices: {
        monthly: {
          amount: 1000, // $10/month
          interval: 'month',
        },
      },
      features: ['basicAnalytics'],
    },
    pro: {
      name: 'Pro Plan',
      prices: {
        annual: {
          amount: 20000, // $200/year
          interval: 'year',
        },
      },
      features: ['basicAnalytics', 'aiReporting'],
    },
  },
};

export default defineConfig(config);