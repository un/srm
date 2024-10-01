export declare const config: {
    features: {
        basicAnalytics: string;
        aiReporting: string;
    };
    products: {
        hobby: {
            name: string;
            id: string;
            taxCode: "txcd_10103000";
            prices: {
                monthly: {
                    amount: number;
                    interval: "month";
                    type: "recurring";
                };
                lifetime: {
                    amount: number;
                    interval: "one_time";
                    type: "one_time";
                };
            };
            features: string[];
        };
        pro: {
            name: string;
            id: string;
            taxCode: "txcd_10103000";
            prices: {
                annual: {
                    amount: number;
                    interval: "year";
                    type: "recurring";
                };
            };
            features: string[];
        };
        enterprise: {
            name: string;
            id: string;
            prices: {
                annual: {
                    amount: number;
                    interval: "year";
                    type: "recurring";
                };
            };
            features: string[];
        };
    };
    webhooks: {
        endpoint: string;
        events: ("checkout.session.completed" | "customer.subscription.deleted" | "invoice.payment_failed")[];
    };
};
