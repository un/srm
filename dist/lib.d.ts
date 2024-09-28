import Stripe from 'stripe';
import { SRMProduct, SRMPrice, PreSRMConfig, CheckoutUrlParams, OneTimeSRMPrice, RecurringSRMPrice } from './types';
export type EnhancedSRMConfig<T extends PreSRMConfig> = {
    [P in keyof T]: P extends 'products' ? {
        [K in keyof T['products'] & string]: EnhancedSRMProduct<T['products'][K], K>;
    } : T[P];
};
export type EnhancedSRMProduct<TProduct extends SRMProduct, ProductId extends string> = TProduct & {
    prices: {
        [K in keyof TProduct['prices'] & string]: EnhancedSRMPrice<TProduct['prices'][K], K, ProductId>;
    };
};
export type EnhancedSRMPrice<TPrice extends SRMPrice, PriceId extends string, ProductId extends string> = TPrice['type'] extends 'recurring' ? RecurringSRMPrice & {
    createSubscriptionCheckoutUrl: (params: CheckoutUrlParams) => Promise<string>;
} : TPrice['type'] extends 'one_time' ? OneTimeSRMPrice & {
    createOneTimePaymentCheckoutUrl: (params: CheckoutUrlParams) => Promise<string>;
} : never;
export declare const createSRM: <T extends PreSRMConfig>(config: T, dependencies: {
    stripe: Stripe;
}) => EnhancedSRMConfig<T>;
