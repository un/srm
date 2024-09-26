⚠️ SRM is currently in development and not yet ready for production use ⚠️

# SRM (Stripe Resource Manager)

SRM is a CLI tool for managing Stripe subscription products and pricing plans. Define products in TypeScript, deploy to Stripe, and generate checkout URLs.

## Features

- Define products and pricing in TypeScript in a `srm.config.ts` file
- Deploy configurations to Stripe with `srm deploy`
- Generate Stripe Checkout URLs like this: `srm.products.hobby.prices.monthly.createSubscriptionCheckoutUrl({ userId: "user123" })`
- Pull existing Stripe products and configurations with `srm pull`

## Installation

Currently, SRM is not available on npm. To install it, you can clone the repository and install it locally:

```bash
git clone https://github.com/your-username/srm.git
cd srm
npm install
npm link
```

This will clone the repository, install the dependencies, and create a global symlink to the package, allowing you to use the `srm` command.

## Usage

### Configuration

Define your products in `srm.config.ts`:

```typescript
import { PreSRMConfig } from "srm";

export const config: PreSRMConfig = {
  features: {
    basicAnalytics: 'Basic Analytics',
    aiReporting: 'AI Reporting',
  },
  products: {
    hobby: {
      name: 'Hobby Plan',
      id: 'hobby',
      prices: {
        monthly: {
          amount: 1000,
          interval: 'month',
        },
      },
      features: ['basicAnalytics'],
    },
    // ... other products
  },
};
```

### Deployment

Deploy your configuration:

```bash
srm deploy --config ./path/to/srm.config.ts --env .env
```

### Creating a Checkout URL

```typescript
import { createSRM } from "srm";
import { config } from "./srm.config";
import Stripe from "stripe";

const srm = createSRM(config, {
  stripe: new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" }),
});

const url = await srm.products.hobby.prices.monthly.createSubscriptionCheckoutUrl({
  userId: "user123",
});
console.log(url);
```

## CLI Commands

- `srm deploy`: Deploy configuration to Stripe
- `srm pull`: Pull configuration from Stripe

## Contributing

Contributions are welcome! Please fork the repository and open a pull request with your changes.

## License

This project is licensed under the MIT License.
