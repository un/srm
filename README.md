⚠️ very experimental not recommended for prod.

# SRM (Stripe Resource Manager)

SRM is a streamlined Stripe Resource Manager designed to simplify the management of subscription products and pricing plans. It allows you to define your products and their pricing configurations in a TypeScript configuration file, deploy them to Stripe, and generate checkout URLs for seamless subscription management.

## Table of Contents

- [SRM (Stripe Resource Manager)](#srm-stripe-resource-manager)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
    - [Steps to Deploy](#steps-to-deploy)
  - [Usage](#usage)
    - [Deploying Configuration to Stripe](#deploying-configuration-to-stripe)
    - [Creating a Checkout URL](#creating-a-checkout-url)
  - [Project Structure](#project-structure)
  - [Scripts](#scripts)
  - [Price ID Mapping](#price-id-mapping)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- **Easy Configuration**: Define products, pricing plans, and features in a simple TypeScript configuration file.
- **Automated Deployment**: Sync your local configurations with Stripe seamlessly.
- **Checkout Integration**: Generate Stripe Checkout URLs for user subscriptions.
- **Price ID Mapping**: Maintain a mapping between your local price keys and Stripe price IDs for easy reference.
- **Environment Management**: Manage sensitive information using environment variables.

## Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Stripe](https://stripe.com/) account with API keys

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/benjaminshafii/srm.git

   cd srm
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

3. **Setup Environment Variables**

   Create a `.env` file in the root directory and add your Stripe secret key:

   ```env
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

## Configuration

1. **Define Your SRM Configuration**

   Navigate to `./examples/srm.config.ts` and define your products, pricing plans, and features. Here's an example configuration:

   ````typescript:examples/srm.config.ts
   import * as Stripe from 'stripe';
   import { SRMConfig } from "../src/types";
   import { createSRM } from "../src/lib";
   import { features } from 'process';

   export const config = {
     features: {
       basicAnalytics: 'Basic Analytics',
       aiReporting: 'AI Reporting',
       customReports: 'Custom Reports',
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
       enterprise: {
         name: 'Enterprise Plan',
         id: 'enterprise',
         prices: {
           annual: {
             amount: 20000, // $200/year
             interval: 'year',
           },
         },
         features: ['basicAnalytics', 'aiReporting', 'customReports'],
       },
       megaPlan: {
         name: 'Mega Plan',
         id: 'megaPlan',
         prices: {
           annual: {
             amount: 50000, // $500/year
             interval: 'year',
           },
         },
         features: ['basicAnalytics', 'aiReporting', 'customReports', 'premiumSupport'],
       },
     },
   } as const;

   export type SRMConfig = typeof config;

   const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

   export default createSRM<SRMConfig>(config, {
     stripe: stripe,
   });
   ````

   - **Features**: Define the features available in your products.
   - **Products**: Define your subscription products, their pricing plans, and associated features.
   - **Stripe Integration**: Initialize Stripe with your secret key.

## Deployment

After configuring your products and pricing plans, deploy the configuration to Stripe to synchronize your local setup with your Stripe account.

### Steps to Deploy

1. **Ensure Configuration is Defined**

   Make sure that your `srm.config.ts` file is correctly defined in the `./examples` directory.

2. **Run the Deployment Script**

   Use the CLI to deploy your configurations:

   ```bash
   npx ts-node ./src/srm.ts deploy --config ./examples/srm.config.ts --env .env
   ```

   **Parameters:**
   
   - `--config`: Path to your SRM configuration file.
   - `--env`: Path to your environment variables file.

   **Output:**

   - Synchronizes products and prices with Stripe.
   - Generates a `price-id-mapping.json` file in the root directory, mapping your local price keys to Stripe price IDs.

## Usage

### Deploying Configuration to Stripe

Deploy your configuration to Stripe to create or update products and pricing plans.

### Creating a Checkout URL

Use the provided example scripts to generate Stripe Checkout URLs for subscriptions.

1. **Example Script**

   Located at `./examples/createCheckout.ts`.

   ````typescript:examples/createCheckout.ts
   import dotenv from "dotenv";
   dotenv.config();
   import  srm  from "./srm.config";

   (async () => {
     const url = await srm
       .products
       .enterprise
       .prices.annual.createSubscriptionCheckoutUrl({ userId: 'testId' })

     console.log(url)
   })();
   ````

   **Explanation:**

   - Imports and initializes environment variables.
   - Imports the SRM configuration.
   - Generates a checkout URL for the `enterprise` product with the `annual` pricing plan for the user with `userId: 'testId'`.

2. **Run the Example Script**

   ```bash
   ts-node ./examples/createCheckout.ts
   ```

   **Output**: The script will output a Stripe Checkout URL that you can use to initiate a subscription for the specified user.

## Project Structure

```
srm/
├── examples/
│   ├── createCheckout.ts      # Example script to create a checkout URL
│   └── srm.config.ts          # Example SRM configuration
├── src/
│   ├── create-checkout.ts     # Function to create Stripe Checkout URLs
│   ├── deploy.ts              # Deployment script to sync with Stripe
│   ├── lib.ts                 # Library functions for SRM
│   ├── srm.ts                 # CLI entry point
│   └── types.ts               # Type definitions
├── .env                       # Environment variables
├── price-id-mapping.json      # Generated mapping of price IDs (after deployment)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

- **Deploy Configuration**

  Deploys the SRM configuration to Stripe.

  ```bash
  npx ts-node ./src/srm.ts deploy --config ./examples/srm.config.ts --env .env
  ```

- **Create Checkout URL**

  Generates a Stripe Checkout URL for a specific product and pricing plan.

  ```bash
  ts-node ./examples/createCheckout.ts
  ```

## Price ID Mapping

After deploying your configuration, a `price-id-mapping.json` file is generated in the root directory. This file maps your local price keys to Stripe price IDs, enabling seamless reference in your application.

**Example `price-id-mapping.json`:**

```json
{
  "hobby": {
    "productId": "prod_ABC123",
    "prices": {
      "monthly": "price_DEF456"
    }
  },
  "pro": {
    "productId": "prod_GHI789",
    "prices": {
      "annual": "price_JKL012"
    }
  },
  "enterprise": {
    "productId": "prod_MNO345",
    "prices": {
      "annual": "price_PQR678"
    }
  },
  "megaPlan": {
    "productId": "prod_STU901",
    "prices": {
      "annual": "price_VWX234"
    }
  }
}
```

**Usage in Application:**

The `createCheckout.ts` script utilizes this mapping to generate checkout URLs based on the product and price keys defined in your configuration.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).

---

