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
  config: T ,
  dependencies: { stripe: Stripe }
): EnhancedSRMConfig<T> => {
  const { stripe } = dependencies;
  const createSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl(stripe);

  // Enhance products with additional methods on prices
  const enhancedProducts = Object.entries(config.products).reduce((acc, [productId, product]) => {
    const enhancedPrices = Object.entries(product.prices).reduce((priceAcc, [priceId, price]) => {
      const enhancedPrice: EnhancedSRMPrice<typeof price, string, string> = {
        ...price,
        createSubscriptionCheckoutUrl: ({ userId }) =>
          createSubscriptionCheckoutUrl({ userId, productKey: productId, priceKey: priceId }),
      };
      priceAcc[priceId as keyof typeof product.prices & string] = enhancedPrice;
      return priceAcc;
    }, {} as Record<string, EnhancedSRMPrice<any, any, any>>);

    const enhancedProduct: EnhancedSRMProduct<typeof product, string> = {
      ...product,
      prices: enhancedPrices,
    };
    acc[productId as keyof typeof config.products & string] = enhancedProduct;
    return acc;
  }, {} as Record<string, EnhancedSRMProduct<any, any>>);

  return {
    ...config,
    products: enhancedProducts,
  } as EnhancedSRMConfig<T>;
};
