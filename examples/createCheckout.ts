import config from "./srm.config";

(async () => {
  const url =
    await config.products.hobby.prices.monthly.createSubscriptionCheckoutUrl({
      userId: "123",
    });

  console.log(url);
})();
