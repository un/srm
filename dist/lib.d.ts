import Stripe from 'stripe';
import { SRMProduct, SRMPrice, PreSRMConfig, CheckoutUrlParams } from './types';
interface ExtendedCheckoutUrlParams extends CheckoutUrlParams {
    allowPromotionCodes?: boolean;
    trialPeriodDays?: number;
}
export type EnhancedSRMConfig<T extends PreSRMConfig> = T & {
    products: {
        [K in keyof T['products']]: EnhancedSRMProduct<T['products'][K]>;
    };
};
type EnhancedSRMProduct<T extends SRMProduct> = T & {
    prices: {
        [K in keyof T['prices']]: T['prices'][K] & EnhancedSRMPrice<T['prices'][K]>;
    };
};
type EnhancedSRMPrice<T extends SRMPrice> = T['type'] extends 'recurring' ? T & {
    createSubscriptionCheckoutUrl: (params: ExtendedCheckoutUrlParams) => Promise<string>;
} : T & {
    createOneTimePaymentCheckoutUrl: (params: ExtendedCheckoutUrlParams) => Promise<string>;
};
export declare const createSRM: <T extends PreSRMConfig>(config: T, dependencies: {
    stripe: Stripe;
}) => EnhancedSRMConfig<T>;
export {};
