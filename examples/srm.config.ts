import { createSubscriptionCheckoutUrl } from '../src/create-checkout';

// Helper function to get typed entries
function typedEntries<V>(obj: { [key: string]: V }): [string, V][] {
  return Object.entries(obj) as [string, V][];
}

// Define enhanced types
interface EnhancedSRMPrice extends SRMPrice {
  createSubscriptionCheckoutUrl: (params: { userId: string }) => Promise<string>;
}

interface EnhancedSRMProduct extends SRMProduct {
  prices: { [key: string]: EnhancedSRMPrice };
}

interface EnhancedSRMConfig {
  products: { [key: string]: EnhancedSRMProduct };
  features: { [key: string]: string };
}

const defineConfig = (config: SRMConfig): EnhancedSRMConfig => {
  // Enhance products with methods
  const enhancedProducts = Object.fromEntries(
    typedEntries(config.products).map(([productKey, product]) => {
      const enhancedPrices = Object.fromEntries(
        typedEntries(product.prices).map(([priceKey, price]) => [
          priceKey,
          {
            ...price,
            createSubscriptionCheckoutUrl: async (params: { userId: string }) => {
              return await createSubscriptionCheckoutUrl({
                userId: params.userId,
                productKey,
                priceKey,
              });
            },
          } as EnhancedSRMPrice,
        ])
      );

      return [
        productKey,
        {
          ...product,
          prices: enhancedPrices,
        } as EnhancedSRMProduct,
      ];
    })
  );

  return {
    ...config,
    products: enhancedProducts,
  };
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