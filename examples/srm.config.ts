import { PreSRMConfig } from "../src/types";
import { taxCodes } from "../src/taxCodes";


export const config = {
  features: {
    basicAnalytics: 'Basic Analytics',
    aiReporting: 'AI Reporting',
  },
  products: {
    hobby: {
      name: 'Hobby Plan',
      id: 'hobby',
      taxCode: taxCodes.SOFTWARE_AS_A_SERVICE,
      prices: {
        monthly: {
          amount: 1000,
          interval: 'month',
          type: 'recurring',
        },
        lifetime: {
          amount: 20000,
          interval: 'one_time',
          type: 'one_time',
        },
      },
      features: ['basicAnalytics'],
    },
    pro: {
      name: 'Pro Plan',
      id: 'pro',
      taxCode: taxCodes.SOFTWARE_AS_A_SERVICE,
      prices: {
        annual: {
          amount: 20000,
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
          amount: 20000,
          interval: 'year',
          type: 'recurring',
          // tax_code is optional; will default if not specified
        },
      },
      features: ['basicAnalytics', 'aiReporting', 'customReports'],
    },
  },
} satisfies PreSRMConfig;


