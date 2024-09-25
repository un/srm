import * as Stripe from 'stripe';
import { PreSRMConfig } from "../src/types";
import { createSRM } from "../src/lib";

export const config = {
  features: {
    basicAnalytics: 'Basic Analytics',
    aiReporting: 'AI Reporting',
  },
  products: {
    hobby: {
      name: 'Hobby Plan',
      id:'hobby',
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
      id: 'pro',
      prices: {
        annual: {
          amount: 20000, // $200/year
          interval: 'year',
        },
      },
      features: ['basicAnalytics', 'aiReporting'],
    },
    mega: {
      name: 'Mega Plan',
      id: 'mega',
      prices: {
        monthly: {
          amount: 10000, // $100/month
          interval: 'month',
        },
      },
        features: ['basicAnalytics', 'aiReporting'],
    },
  },
} as const;


export type SRMConfig = typeof config;

const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

export default createSRM<SRMConfig>(config, {
  stripe: stripe,
});
