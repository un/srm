import fs from "fs";
import Stripe from "stripe";

interface CreateCheckoutParams {
  userId: string;
  productKey: string;
  priceKey: string;
  quantity?: number;
  successUrl: string;
  cancelUrl: string;
}

export function makeCreateSubscriptionCheckoutUrl(stripe: Stripe) {
  return async function createSubscriptionCheckoutUrl(
    params: CreateCheckoutParams
  ): Promise<string> {
    const { userId, productKey, priceKey, quantity, successUrl, cancelUrl } = params;

    const priceId = getPriceId(productKey, priceKey);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        metadata: { userId },
        subscription_data: {
          trial_period_days: 3,
          metadata: {
            userId,
          },
        },
        line_items: [
          {
            price: priceId,
            quantity: quantity || 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        allow_promotion_codes: true,
      });

      return session.url!;
    } catch (error) {
      console.error("Error creating Stripe Subscription Checkout Session:", error);
      throw new Error("Failed to create subscription checkout session.");
    }
  };
}

export function makeCreateOneTimePaymentCheckoutUrl(stripe: Stripe) {
  return async function createOneTimePaymentCheckoutUrl(
    params: CreateCheckoutParams
  ): Promise<string> {
    const { userId, productKey, priceKey, quantity, successUrl, cancelUrl } = params;

    const priceId = getPriceId(productKey, priceKey);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        metadata: { userId },
        payment_intent_data: {
          metadata: {
            userId,
          },
        },
        line_items: [
          {
            price: priceId,
            quantity: quantity || 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        allow_promotion_codes: true,
      });

      return session.url!;
    } catch (error) {
      console.error("Error creating Stripe One-Time Payment Checkout Session:", error);
      throw new Error("Failed to create one-time payment checkout session.");
    }
  };
}

function getPriceId(productKey: string, priceKey: string): string {
  let priceIdMapping: Record<string, any>;
  try {
    const mappingData = fs.readFileSync("price-id-mapping.json", "utf-8");
    priceIdMapping = JSON.parse(mappingData);
  } catch (error) {
    console.error("Error reading price-id-mapping.json:", error);
    throw new Error("Failed to load price ID mapping.");
  }

  const priceId = priceIdMapping[productKey]?.prices[priceKey];
  if (!priceId) {
    throw new Error(
      `Price ID not found for product "${productKey}" and price "${priceKey}"`
    );
  }

  return priceId;
}
