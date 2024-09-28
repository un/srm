import { makeCreateSubscriptionCheckoutUrl, makeCreateOneTimePaymentCheckoutUrl } from './create-checkout';
import Stripe from 'stripe';
import { 
  SRMProduct, 
  SRMPrice, 
  PreSRMConfig, 
  CheckoutUrlParams, 
  OneTimeSRMPrice,
  RecurringSRMPrice
} from './types';

// Extended CheckoutUrlParams to include new options
interface ExtendedCheckoutUrlParams extends CheckoutUrlParams {
  allowPromotionCodes?: boolean;
  trialPeriodDays?: number;
}

// Define the structure for the enhanced SRM configuration
export type EnhancedSRMConfig<T extends PreSRMConfig> = {
  [P in keyof T]: P extends 'products'
    ? {
        [K in keyof T['products'] & string]: EnhancedSRMProduct<T['products'][K], K>;
      }
    : T[P];
};

// Enhanced Product with methods added to prices
export type EnhancedSRMProduct<TProduct extends SRMProduct, ProductId extends string> = 
  TProduct & {
    prices: {
      [K in keyof TProduct['prices'] & string]: EnhancedSRMPrice<TProduct['prices'][K], K, ProductId>;
    };
  };

// Enhanced Price with appropriate methods based on type
export type EnhancedSRMPrice<TPrice extends SRMPrice, PriceId extends string, ProductId extends string> = 
  TPrice['type'] extends 'recurring' 
    ? RecurringSRMPrice & {
        createSubscriptionCheckoutUrl: (params: ExtendedCheckoutUrlParams) => Promise<string>;
      }
    : TPrice['type'] extends 'one_time'
    ? OneTimeSRMPrice & {
        createOneTimePaymentCheckoutUrl: (params: ExtendedCheckoutUrlParams) => Promise<string>;
      }
    : never;

export const createSRM = <T extends PreSRMConfig>(
  config: T,
  dependencies: { stripe: Stripe }
): EnhancedSRMConfig<T> => {
  const { stripe } = dependencies;
  const createSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl(stripe);
  const createOneTimePaymentCheckoutUrl = makeCreateOneTimePaymentCheckoutUrl(stripe);
  const enhancedProducts: Record<string, EnhancedSRMProduct<any, any>> = {};

  for (const productId in config.products) {
    if (config.products.hasOwnProperty(productId)) {
      const product = config.products[productId];
      const enhancedPrices: Record<string, EnhancedSRMPrice<any, any, any>> = {};

      for (const priceId in product.prices) {
        if (product.prices.hasOwnProperty(priceId)) {
          const price = product.prices[priceId];
          if (price.type === 'recurring') {
            enhancedPrices[priceId] = {
              ...price,
              createSubscriptionCheckoutUrl: ({ userId, successUrl, cancelUrl, allowPromotionCodes, trialPeriodDays }: ExtendedCheckoutUrlParams) =>
                createSubscriptionCheckoutUrl({ userId, productKey: productId, priceKey: priceId, successUrl, cancelUrl, allowPromotionCodes, trialPeriodDays })
            } as EnhancedSRMPrice<typeof price, typeof priceId, typeof productId>;
          } else if (price.type === 'one_time') {
            enhancedPrices[priceId] = {
              ...price,
              createOneTimePaymentCheckoutUrl: ({ userId, successUrl, cancelUrl, allowPromotionCodes }: ExtendedCheckoutUrlParams) =>
                createOneTimePaymentCheckoutUrl({ userId, productKey: productId, priceKey: priceId, successUrl, cancelUrl, allowPromotionCodes })
            } as EnhancedSRMPrice<typeof price, typeof priceId, typeof productId>;
          }
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
