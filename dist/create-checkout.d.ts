import Stripe from "stripe";
interface BaseCheckoutParams {
    userId: string;
    productKey: string;
    priceKey: string;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
    allowPromotionCodes?: boolean;
}
interface SubscriptionCheckoutParams extends BaseCheckoutParams {
    trialPeriodDays?: number;
}
interface OneTimePaymentCheckoutParams extends BaseCheckoutParams {
}
export declare function makeCreateSubscriptionCheckoutUrl(stripe: Stripe): (params: SubscriptionCheckoutParams) => Promise<string>;
export declare function makeCreateOneTimePaymentCheckoutUrl(stripe: Stripe): (params: OneTimePaymentCheckoutParams) => Promise<string>;
export {};
