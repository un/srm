"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSRM = void 0;
const create_checkout_1 = require("./create-checkout");
const createSRM = (config, dependencies) => {
    const { stripe } = dependencies;
    const createSubscriptionCheckoutUrl = (0, create_checkout_1.makeCreateSubscriptionCheckoutUrl)(stripe);
    const createOneTimePaymentCheckoutUrl = (0, create_checkout_1.makeCreateOneTimePaymentCheckoutUrl)(stripe);
    const enhancedProducts = {};
    for (const productId in config.products) {
        if (config.products.hasOwnProperty(productId)) {
            const product = config.products[productId];
            const enhancedPrices = {};
            for (const priceId in product.prices) {
                if (product.prices.hasOwnProperty(priceId)) {
                    const price = product.prices[priceId];
                    if (price.type === 'recurring') {
                        enhancedPrices[priceId] = {
                            ...price,
                            createSubscriptionCheckoutUrl: ({ userId, successUrl, cancelUrl }) => createSubscriptionCheckoutUrl({ userId, productKey: productId, priceKey: priceId, successUrl, cancelUrl })
                        };
                    }
                    else if (price.type === 'one_time') {
                        enhancedPrices[priceId] = {
                            ...price,
                            createOneTimePaymentCheckoutUrl: ({ userId, successUrl, cancelUrl }) => createOneTimePaymentCheckoutUrl({ userId, productKey: productId, priceKey: priceId, successUrl, cancelUrl })
                        };
                    }
                }
            }
            enhancedProducts[productId] = {
                ...product,
                prices: enhancedPrices,
            };
        }
    }
    return {
        ...config,
        products: enhancedProducts,
    };
};
exports.createSRM = createSRM;
