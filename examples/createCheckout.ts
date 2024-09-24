import  srm  from "./srm.config";
import dotenv from "dotenv";

dotenv.config();

(async () => {
    const url =
      await srm.products.hobby.prices.monthly.createSubscriptionCheckoutUrl({
        userId: "123",
      });

  console.log(url);
})();
