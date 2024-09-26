import fs from "fs";
import Stripe from "stripe";

interface CreateCheckoutParams {
  userId: string;
  productKey: string;
  priceKey: string;
  quantity?: number;
}

export function makeCreateSubscriptionCheckoutUrl(stripe: Stripe) {
  return async function createSubscriptionCheckoutUrl(
    params: CreateCheckoutParams
  ): Promise<string> {
    const { userId, productKey, priceKey, quantity } = params;

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

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: quantity || 1,
          },
        ],
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
        client_reference_id: userId,
      });

      return session.url!;
    } catch (error) {
      console.error("Error creating Stripe Checkout Session:", error);
      throw new Error("Failed to create checkout session.");
    }
  };
}
