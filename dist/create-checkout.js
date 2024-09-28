"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCreateSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl;
exports.makeCreateOneTimePaymentCheckoutUrl = makeCreateOneTimePaymentCheckoutUrl;
const fs_1 = __importDefault(require("fs"));
function makeCreateSubscriptionCheckoutUrl(stripe) {
    return async function createSubscriptionCheckoutUrl(params) {
        const { userId, productKey, priceKey, quantity, successUrl, cancelUrl, allowPromotionCodes = false, trialPeriodDays, } = params;
        const priceId = getPriceId(productKey, priceKey);
        try {
            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                payment_method_types: ["card"],
                metadata: { userId },
                subscription_data: {
                    ...(trialPeriodDays && { trial_period_days: trialPeriodDays }),
                    metadata: {
                        userId,
                    },
                },
                line_items: [
                    {
                        price: priceId,
                        quantity: quantity || 1,
                    },
                ],
                success_url: successUrl,
                cancel_url: cancelUrl,
                client_reference_id: userId,
                allow_promotion_codes: allowPromotionCodes,
            });
            return session.url;
        }
        catch (error) {
            console.error("Error creating Stripe Subscription Checkout Session:", error);
            throw new Error("Failed to create subscription checkout session.");
        }
    };
}
function makeCreateOneTimePaymentCheckoutUrl(stripe) {
    return async function createOneTimePaymentCheckoutUrl(params) {
        const { userId, productKey, priceKey, quantity, successUrl, cancelUrl, allowPromotionCodes = false, } = params;
        const priceId = getPriceId(productKey, priceKey);
        try {
            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                metadata: { userId },
                payment_intent_data: {
                    metadata: {
                        userId,
                    },
                },
                line_items: [
                    {
                        price: priceId,
                        quantity: quantity || 1,
                    },
                ],
                success_url: successUrl,
                cancel_url: cancelUrl,
                client_reference_id: userId,
                allow_promotion_codes: allowPromotionCodes,
            });
            return session.url;
        }
        catch (error) {
            console.error("Error creating Stripe One-Time Payment Checkout Session:", error);
            throw new Error("Failed to create one-time payment checkout session.");
        }
    };
}
function getPriceId(productKey, priceKey) {
    var _a;
    let priceIdMapping;
    try {
        const mappingData = fs_1.default.readFileSync("price-id-mapping.json", "utf-8");
        priceIdMapping = JSON.parse(mappingData);
    }
    catch (error) {
        console.error("Error reading price-id-mapping.json:", error);
        throw new Error("Failed to load price ID mapping.");
    }
    const priceId = (_a = priceIdMapping[productKey]) === null || _a === void 0 ? void 0 : _a.prices[priceKey];
    if (!priceId) {
        throw new Error(`Price ID not found for product "${productKey}" and price "${priceKey}"`);
    }
    return priceId;
}
