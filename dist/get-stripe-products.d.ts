import Stripe from 'stripe';
interface FetchedProduct {
    name: string;
    id: string;
    prices: {
        [key: string]: {
            amount: number;
            interval: Stripe.Price.Recurring.Interval;
        };
    };
    features: string[];
}
export declare function fetchProducts(): Promise<FetchedProduct[]>;
export declare function generateConfigString(products: FetchedProduct[]): string;
export {};
