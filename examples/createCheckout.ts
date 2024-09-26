import dotenv from "dotenv";
dotenv.config();
import { config } from "./srm.config";

import { createSRM } from "../src/lib";
import Stripe from "stripe";

type Config = typeof config;

const srm = createSRM<Config>(config, {
  stripe: new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20",
  }),
});

(async () => {
  const url = await srm.products.enterprise.prices.annual.createSubscriptionCheckoutUrl({
    userId: "testId",
  });

  console.log(url);
})();
