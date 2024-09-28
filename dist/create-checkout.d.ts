import Stripe from "stripe";
interface CreateCheckoutParams {
    userId: string;
    productKey: string;
    priceKey: string;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
}
export declare function makeCreateSubscriptionCheckoutUrl(stripe: Stripe): (params: CreateCheckoutParams) => Promise<string>;
export declare function makeCreateOneTimePaymentCheckoutUrl(stripe: Stripe): (params: CreateCheckoutParams) => Promise<string>;
export {};
