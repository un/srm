import { makeCreateSubscriptionCheckoutUrl } from './create-checkout';
import Stripe from 'stripe';
import { SRMConfig, SRMProduct, SRMPrice } from './types';

// Enhanced types
type Interval = 'month' | 'year';

interface EnhancedPrice extends SRMPrice {
  createSubscriptionCheckoutUrl: (params: { userId: string }) => Promise<string>;
}

interface EnhancedProduct extends Omit<SRMProduct, 'prices'> {
  prices: Record<string, EnhancedPrice>;
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

  const enhancePrice = (productKey: string, priceKey: string, price: SRMPrice): EnhancedPrice => ({
    ...price,
    createSubscriptionCheckoutUrl: ({ userId }: { userId: string }) =>
      createSubscriptionCheckoutUrl({ userId, productKey, priceKey }),
  });

  const enhanceProduct = (productKey: string, product: SRMProduct): EnhancedProduct => ({
    ...product,
    prices: Object.keys(product.prices).reduce((acc, priceKey) => {
      acc[priceKey] = enhancePrice(productKey, priceKey, product.prices[priceKey]);
      return acc;
    }, {} as Record<string, EnhancedPrice>),
  });

  const enhancedProducts: Record<string, EnhancedProduct> = Object.keys(config.products).reduce((acc, productKey) => {
    acc[productKey] = enhanceProduct(productKey, config.products[productKey]);
    return acc;
  }, {} as Record<string, EnhancedProduct>);

  return {
    ...config,
    products: enhancedProducts,
  };
};