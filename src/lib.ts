import { makeCreateSubscriptionCheckoutUrl } from './create-checkout';
import Stripe from 'stripe';
import { SRMConfig } from './types';

// Enhanced types
type Interval = 'month' | 'year';

interface EnhancedPrice {
  amount: number;
  interval: Interval;
  createSubscriptionCheckoutUrl: (params: { userId: string }) => Promise<string>;
}

interface EnhancedProduct {
  name: string;
  prices: Record<string, EnhancedPrice>;
  features: string[];
}

interface EnhancedSRMConfig extends Omit<SRMConfig, 'products'> {
  products: Record<string, EnhancedProduct>;
}

export const createSRM = (
  config: SRMConfig,
  dependencies: { stripe: Stripe }
): EnhancedSRMConfig => {
  const { stripe } = dependencies;
  const createSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl(stripe);
  console.log(config);

  const enhancedProducts: Record<string, EnhancedProduct> = Object.fromEntries(
    // @ts-ignore
    Object.entries(config.products).map(([productKey, product]) => [
      productKey,
      {
        ...product,
        prices: Object.fromEntries(
          Object.entries(product.prices).map(([priceKey, price]) => [
            priceKey,
            {
              ...price,
              createSubscriptionCheckoutUrl: ({ userId }) =>
                createSubscriptionCheckoutUrl({ userId, productKey, priceKey }),
            },
          ])
        ),
      },
    ])
  );

  return {
    ...config,
    products: enhancedProducts,
  };
};