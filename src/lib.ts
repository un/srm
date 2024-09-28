import { makeCreateSubscriptionCheckoutUrl, makeCreateOneTimePaymentCheckoutUrl } from './create-checkout';
import Stripe from 'stripe';
import { 
  SRMProduct, 
  SRMPrice, 
  PreSRMConfig, 
  CheckoutUrlParams
} from './types';

// Extended CheckoutUrlParams to include new options


// Simplified EnhancedSRMConfig type
export type EnhancedSRMConfig<T extends PreSRMConfig> = T & {
  products: {
    [K in keyof T['products']]: EnhancedSRMProduct<T['products'][K]>;
  };
};

// Simplified EnhancedSRMProduct type
type EnhancedSRMProduct<T extends SRMProduct> = T & {
  prices: {
    [K in keyof T['prices']]: T['prices'][K] & EnhancedSRMPrice<T['prices'][K]>;
  };
};

// Simplified EnhancedSRMPrice type
type EnhancedSRMPrice<T extends SRMPrice> = T['type'] extends 'recurring'
  ? T & { createSubscriptionCheckoutUrl: (params: CheckoutUrlParams & { trialPeriodDays?: number }) => Promise<string> }
  : T & { createOneTimePaymentCheckoutUrl: (params: CheckoutUrlParams) => Promise<string> };

export const createSRM = <T extends PreSRMConfig>(
  config: T,
  dependencies: { stripe: Stripe }
): EnhancedSRMConfig<T> => {
  const { stripe } = dependencies;
  const createSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl(stripe);
  const createOneTimePaymentCheckoutUrl = makeCreateOneTimePaymentCheckoutUrl(stripe);

  const enhancedProducts = Object.entries(config.products).reduce((acc, [productId, product]) => {
    const enhancedPrices = Object.entries(product.prices).reduce((priceAcc, [priceId, price]) => {
      const enhancedPrice = {
        ...price,
        ...(price.type === 'recurring'
          ? {
              createSubscriptionCheckoutUrl: (params: CheckoutUrlParams & { trialPeriodDays?: number }) =>
                createSubscriptionCheckoutUrl({ ...params, productKey: productId, priceKey: priceId })
            }
          : {
              createOneTimePaymentCheckoutUrl: (params: CheckoutUrlParams) =>
                createOneTimePaymentCheckoutUrl({ ...params, productKey: productId, priceKey: priceId })
            })
      };
      return { ...priceAcc, [priceId]: enhancedPrice };
    }, {});

    return { ...acc, [productId]: { ...product, prices: enhancedPrices } };
  }, {});

  return {
    ...config,
    products: enhancedProducts,
  } as EnhancedSRMConfig<T>;
};
