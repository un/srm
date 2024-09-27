import { PreSRMConfig } from "../src/types";


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
          type: 'recurring',
        },
        lifetime: {
          amount: 20000, // $200 one-time
          interval: 'one_time',
          type: 'one_time',
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
          type: 'recurring',
        },
      },
      features: ['basicAnalytics', 'aiReporting'],
    },
    enterprise: {
      name: 'Enterprise Plan',
      id: 'enterprise',
      prices: {
        annual: {
          amount: 20000, // $200/year
          interval: 'year',
          type: 'recurring',
        },
      },
      features: ['basicAnalytics', 'aiReporting', 'customReports'],
    },
   
  },
} satisfies PreSRMConfig;


