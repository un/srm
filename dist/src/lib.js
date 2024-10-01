"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSRM = void 0;
const create_checkout_1 = require("./create-checkout");
const createSRM = (config, dependencies) => {
    const { stripe } = dependencies;
    const createSubscriptionCheckoutUrl = (0, create_checkout_1.makeCreateSubscriptionCheckoutUrl)(stripe);
    const createOneTimePaymentCheckoutUrl = (0, create_checkout_1.makeCreateOneTimePaymentCheckoutUrl)(stripe);
    const enhancedProducts = Object.entries(config.products).reduce((acc, [productId, product]) => {
        const enhancedPrices = Object.entries(product.prices).reduce((priceAcc, [priceId, price]) => {
            const enhancedPrice = {
                ...price,
                ...(price.type === 'recurring'
                    ? {
                        createSubscriptionCheckoutUrl: (params) => createSubscriptionCheckoutUrl({ ...params, productKey: productId, priceKey: priceId })
                    }
                    : {
                        createOneTimePaymentCheckoutUrl: (params) => createOneTimePaymentCheckoutUrl({ ...params, productKey: productId, priceKey: priceId })
                    })
            };
            return { ...priceAcc, [priceId]: enhancedPrice };
        }, {});
        return { ...acc, [productId]: { ...product, prices: enhancedPrices } };
    }, {});
    return {
        ...config,
        products: enhancedProducts,
    };
};
exports.createSRM = createSRM;
