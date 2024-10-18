import { makeCreateSubscriptionCheckoutUrl, makeCreateOneTimePaymentCheckoutUrl } from './create-checkout';
import Stripe from 'stripe';
import { 
  SRMProduct, 
  SRMPrice, 
  PreSRMConfig, 
  CheckoutUrlParams
} from './types';

// Extended CheckoutUrlParams to include new options
interface ExtendedCheckoutUrlParams extends CheckoutUrlParams {
  quantity?: number;
}

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
  ? T & { createSubscriptionCheckoutUrl: (params: ExtendedCheckoutUrlParams & { trialPeriodDays?: number }) => Promise<string> }
  : T & { createOneTimePaymentCheckoutUrl: (params: ExtendedCheckoutUrlParams) => Promise<string> };

export const createSRM = <T extends PreSRMConfig>(
  config: T,
  dependencies: { stripe: Stripe }
): EnhancedSRMConfig<T> => {
  const { stripe } = dependencies;
  const createSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl(stripe);
  const createOneTimePaymentCheckoutUrl = makeCreateOneTimePaymentCheckoutUrl(stripe);

  const enhancePrice = (productId: string, priceId: string, price: SRMPrice) => {
    if (price.type === 'recurring') {
      return {
        ...price,
        createSubscriptionCheckoutUrl: (params: CheckoutUrlParams) =>
          createSubscriptionCheckoutUrl({
            ...params,
            productKey: productId,
            priceKey: priceId,
            trialPeriodDays: price.trialPeriodDays,
          }),
      };
    } else {
      return {
        ...price,
        createOneTimePaymentCheckoutUrl: (params: CheckoutUrlParams) =>
          createOneTimePaymentCheckoutUrl({ ...params, productKey: productId, priceKey: priceId }),
      };
    }
  };

  const enhanceProduct = (productId: string, product: SRMProduct) => {
    const enhancedPrices = Object.fromEntries(
      Object.entries(product.prices).map(([priceId, price]) => [
        priceId,
        enhancePrice(productId, priceId, price),
      ])
    );

    return { ...product, prices: enhancedPrices };
  };

  const enhancedProducts = Object.fromEntries(
    Object.entries(config.products).map(([productId, product]) => [
      productId,
      enhanceProduct(productId, product),
    ])
  );

  return {
    ...config,
    products: enhancedProducts,
  } as EnhancedSRMConfig<T>;
};
