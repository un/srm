"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSRM = void 0;
const create_checkout_1 = require("./create-checkout");
const createSRM = (config, dependencies) => {
    const { stripe } = dependencies;
    const createSubscriptionCheckoutUrl = (0, create_checkout_1.makeCreateSubscriptionCheckoutUrl)(stripe);
    const createOneTimePaymentCheckoutUrl = (0, create_checkout_1.makeCreateOneTimePaymentCheckoutUrl)(stripe);
    const enhancePrice = (productId, priceId, price) => {
        if (price.type === 'recurring') {
            return {
                ...price,
                createSubscriptionCheckoutUrl: (params) => createSubscriptionCheckoutUrl({
                    ...params,
                    productKey: productId,
                    priceKey: priceId,
                    trialPeriodDays: price.trialPeriodDays,
                }),
            };
        }
        else {
            return {
                ...price,
                createOneTimePaymentCheckoutUrl: (params) => createOneTimePaymentCheckoutUrl({ ...params, productKey: productId, priceKey: priceId }),
            };
        }
    };
    const enhanceProduct = (productId, product) => {
        const enhancedPrices = Object.fromEntries(Object.entries(product.prices).map(([priceId, price]) => [
            priceId,
            enhancePrice(productId, priceId, price),
        ]));
        return { ...product, prices: enhancedPrices };
    };
    const enhancedProducts = Object.fromEntries(Object.entries(config.products).map(([productId, product]) => [
        productId,
        enhanceProduct(productId, product),
    ]));
    return {
        ...config,
        products: enhancedProducts,
    };
};
exports.createSRM = createSRM;
