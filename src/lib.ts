import { makeCreateSubscriptionCheckoutUrl } from './create-checkout';
import Stripe from 'stripe';
import { 
  SRMProduct, 
  SRMPrice, 
  PreSRMConfig, 
} from './types';


// Define the structure for the enhanced SRM configuration
export type EnhancedSRMConfig<T extends PreSRMConfig> = {
  [P in keyof T]: P extends 'products'
    ? {
        [K in keyof T['products'] & string]: EnhancedSRMProduct<T['products'][K], K>;
      }
    : T[P];
};

// Enhanced Product with methods added to prices
export type EnhancedSRMProduct<TProduct extends SRMProduct, ProductId extends string> = Omit<TProduct, 'prices'> & {
  prices: {
    [K in keyof TProduct['prices'] & string]: EnhancedSRMPrice<TProduct['prices'][K], K, ProductId>;
  };
};

// Enhanced Price with the createSubscriptionCheckoutUrl method
export type EnhancedSRMPrice<TPrice extends SRMPrice, PriceId extends string, ProductId extends string> = TPrice & {
  createSubscriptionCheckoutUrl: (params: { userId: string }) => Promise<string>;
};

export const createSRM = <T extends PreSRMConfig>(
  config: T,
  dependencies: { stripe: Stripe }
): EnhancedSRMConfig<T> => {
  const { stripe } = dependencies;
  const createSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl(stripe);
  const enhancedProducts: Record<string, EnhancedSRMProduct<any, any>> = {};

  for (const productId in config.products) {
    if (config.products.hasOwnProperty(productId)) {
      const product = config.products[productId];
      const enhancedPrices: Record<string, EnhancedSRMPrice<any, any, any>> = {};

      for (const priceId in product.prices) {
        if (product.prices.hasOwnProperty(priceId)) {
          const price = product.prices[priceId];
          enhancedPrices[priceId] = {
            ...price,
            createSubscriptionCheckoutUrl: ({ userId }: { userId: string }) =>
              createSubscriptionCheckoutUrl({ userId, productKey: productId, priceKey: priceId }),
          };
        }
      }

      enhancedProducts[productId] = {
        ...product,
        prices: enhancedPrices,
      };
    }
  }

  return {
    ...config,
    products: enhancedProducts,
  } as EnhancedSRMConfig<T>;
};
