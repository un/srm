import Stripe from "stripe";
import { CheckoutUrlParams } from './types';
interface ExtendedCheckoutUrlParams extends CheckoutUrlParams {
    quantity?: number;
}
interface BaseCheckoutParams extends ExtendedCheckoutUrlParams {
    productKey: string;
    priceKey: string;
}
interface SubscriptionCheckoutParams extends BaseCheckoutParams {
    trialPeriodDays?: number;
}
interface OneTimePaymentCheckoutParams extends BaseCheckoutParams {
}
export declare function makeCreateSubscriptionCheckoutUrl(stripe: Stripe): (params: SubscriptionCheckoutParams) => Promise<string>;
export declare function makeCreateOneTimePaymentCheckoutUrl(stripe: Stripe): (params: OneTimePaymentCheckoutParams) => Promise<string>;
export {};
