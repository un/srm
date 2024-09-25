import dotenv from "dotenv";
dotenv.config();
import  srm  from "./srm.config";



(async () => {
  const url = await srm.products.enterprise
  .prices.annual.createSubscriptionCheckoutUrl({userId: 'test'})
  console.log(url);
      

})();




