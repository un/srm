"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCreateSubscriptionCheckoutUrl = makeCreateSubscriptionCheckoutUrl;
exports.makeCreateOneTimePaymentCheckoutUrl = makeCreateOneTimePaymentCheckoutUrl;
const idCache = { prices: {} };
async function getPriceId(stripe, productKey, priceKey) {
    // Fetch and cache products
    if (!idCache.products) {
        const products = await stripe.products.list({ limit: 100 });
        idCache.products = products.data;
    }
    const product = idCache.products.find((p) => p.metadata.srm_product_key === productKey);
    if (!product) {
        throw new Error(`Product not found for key "${productKey}"`);
    }
    // Fetch and cache prices for the product
    if (!idCache.prices[productKey]) {
        const prices = await stripe.prices.list({ product: product.id, limit: 100 });
        idCache.prices[productKey] = prices.data;
    }
    const price = idCache.prices[productKey].find((p) => p.metadata.srm_price_key === priceKey);
    if (!price) {
        throw new Error(`Price not found for key "${priceKey}" under product "${productKey}"`);
    }
    return price.id;
}
function makeCreateSubscriptionCheckoutUrl(stripe) {
    return async function createSubscriptionCheckoutUrl(params) {
        const { userId, productKey, priceKey, quantity, successUrl, cancelUrl, allowPromotionCodes = false, trialPeriodDays, } = params;
        const priceId = await getPriceId(stripe, productKey, priceKey);
        const price = idCache.prices[productKey].find(p => p.id === priceId);
        if (!price) {
            throw new Error(`Price not found for key "${priceKey}" under product "${productKey}"`);
        }
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
        const priceId = await getPriceId(stripe, productKey, priceKey);
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
// Remove the old getPriceId function that used the JSON file
