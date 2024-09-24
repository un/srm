import * as Stripe from 'stripe';
import { SRMConfig } from "../src/types";
import { createSRM } from "../src/lib";

export const config: SRMConfig = {
  features: {
    basicAnalytics: 'Basic Analytics',
    aiReporting: 'AI Reporting',
  },
  products: {
    hobby: {
      name: 'Hobby Plan',
      prices: {
        monthly: {
          amount: 1000, // $10/month
          interval: 'month',
        },
      },
      features: ['basicAnalytics'],
    },
    pro: {
      name: 'Pro Plan',
      prices: {
        annual: {
          amount: 20000, // $200/year
          interval: 'year',
        },
      },
      features: ['basicAnalytics', 'aiReporting'],
    },
  },
} as const;

const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

export default createSRM(config, {
  stripe: stripe,
});
