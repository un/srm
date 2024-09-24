# SRM (Stripe Resource Manager)

SRM is a streamlined Stripe Resource Manager designed to simplify the management of subscription products and pricing plans. It allows you to define your products and their pricing configurations in a TypeScript configuration file, deploy them to Stripe, and generate checkout URLs for seamless subscription management.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Deploying Configuration to Stripe](#deploying-configuration-to-stripe)
  - [Creating a Checkout URL](#creating-a-checkout-url)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
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

   ```typescript
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
   ```

   - **Features**: Define the features available in your products.
   - **Products**: Define your subscription products, their pricing plans, and associated features.
   - **Stripe Integration**: Initialize Stripe with your secret key.

## Usage

### Deploying Configuration to Stripe

To synchronize your local configuration with Stripe, use the deployment script.

1. **Deploy Using Default Configuration**

   ```bash
   node ./src/srm.js deploy
   ```

2. **Deploy Using Custom Configuration and Environment Files**

   ```bash
   node ./src/srm.js deploy --config ./examples/srm.config.ts --env ./examples/.env
   ```

   - `--config`: Path to your SRM configuration file.
   - `--env`: Path to your environment variables file.

   **Note**: Ensure that your `.env` file contains the `STRIPE_SECRET_KEY`.

3. **Deployment Process**

   - **Products Synchronization**: Creates or updates products in Stripe based on your configuration.
   - **Prices Synchronization**: Creates or updates pricing plans for each product.
   - **Price ID Mapping**: Generates a `price-id-mapping.json` file that maps your local price keys to Stripe price IDs.

### Creating a Checkout URL

Use the provided example script to generate a Stripe Checkout URL for a subscription.

1. **Example Script**

   Located at `./examples/createCheckout.ts`.

   ```typescript
   import srm from "./srm.config";
   import dotenv from "dotenv";
   
   dotenv.config();
   
   (async () => {
       const url =
         await srm.products.hobby.prices.monthly.createSubscriptionCheckoutUrl({
           userId: "123",
         });
   
     console.log(url);
   })();
   ```

2. **Run the Example Script**

   ```bash
   ts-node ./examples/createCheckout.ts
   ```

   **Output**: The script will output a Stripe Checkout URL that you can use to initiate a subscription for the user with `userId: "123"`.

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

  ```bash
  node ./src/srm.js deploy --config [path-to-config] --env [path-to-env]
  ```

- **Create Checkout URL**

  ```bash
  ts-node ./examples/createCheckout.ts
  ```

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

