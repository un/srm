import { SRMConfig, SRMProductConfig } from '../src/types';
import { createSubscriptionCheckoutUrl } from '../src/create-checkout';

const defineConfig = (config: SRMConfig) => {
  // Enhance products with methods
  const enhancedProducts = Object.fromEntries(
    Object.entries(config.products).map(([productKey, product]) => {
      const enhancedPrices = Object.fromEntries(
        Object.entries(product.prices).map(([priceKey, price]) => [
          priceKey,
          {
            ...price,
            createSubscriptionCheckoutUrl: (params: { userId: string }) => {
              return createSubscriptionCheckoutUrl({
                userId: params.userId,
                productKey,
                priceKey,
              });
            },
          },
        ])
      );

      return [
        productKey,
        {
          ...product,
          prices: enhancedPrices,
        },
      ];
    })
  );

  return {
    ...config,
    products: enhancedProducts,
  };
};

export default defineConfig({
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
});