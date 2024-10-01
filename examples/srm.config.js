"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const tax_codes_1 = require("../src/tax-codes");
exports.config = {
    features: {
        basicAnalytics: "Basic Analytics",
        aiReporting: "AI Reporting",
    },
    products: {
        hobby: {
            name: "Hobby Plan",
            id: "hobby",
            taxCode: tax_codes_1.taxCodes.SOFTWARE_AS_A_SERVICE,
            prices: {
                monthly: {
                    amount: 1000,
                    interval: "month",
                    type: "recurring",
                },
                lifetime: {
                    amount: 20000,
                    interval: "one_time",
                    type: "one_time",
                },
            },
            features: ["basicAnalytics"],
        },
        pro: {
            name: "Pro Plan",
            id: "pro",
            taxCode: tax_codes_1.taxCodes.SOFTWARE_AS_A_SERVICE,
            prices: {
                annual: {
                    amount: 20000,
                    interval: "year",
                    type: "recurring",
                },
            },
            features: ["basicAnalytics", "aiReporting"],
        },
        enterprise: {
            name: "Enterprise Plan",
            id: "enterprise",
            prices: {
                annual: {
                    amount: 20000,
                    interval: "year",
                    type: "recurring",
                    // tax_code is optional; will default if not specified
                },
            },
            features: ["basicAnalytics", "aiReporting", "customReports"],
        },
    },
    webhooks: {
        // tip for vercel use e.g `${process.env.VERCEL_BRANCH_URL}/webhook`
        // to get auto-deployed 
        endpoint: "https://srm-example-app.vercel.app/api/webhooks",
        events: [
            "checkout.session.completed",
            "customer.subscription.deleted",
            "invoice.payment_failed",
        ],
    },
};
