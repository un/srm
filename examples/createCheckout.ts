import dotenv from "dotenv";
dotenv.config();
import  srm  from "./srm.config";

console.log('print pwd', process.cwd());

(async () => {
    const url =
      await srm.products.hobby.prices.monthly.createSubscriptionCheckoutUrl({
        userId: "123",
      });

  console.log(url);
})();
