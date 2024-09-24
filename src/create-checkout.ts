import Stripe from "stripe";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

interface CreateCheckoutParams {
  userId: string;
  productKey: string;
  priceKey: string;
}

export async function createSubscriptionCheckoutUrl(
  params: CreateCheckoutParams
): Promise<string> {
  const { userId, productKey, priceKey } = params;
  console.log("params", params);

  let priceIdMapping: Record<string, Record<string, string>>;
  try {
    priceIdMapping = JSON.parse(
      fs.readFileSync("price-id-mapping.json", "utf-8")
    );
    console.log("priceIdMapping", priceIdMapping);
  } catch (error) {
    console.error("Error reading price-id-mapping.json:", error);
  }

  const priceId = priceIdMapping[productKey]?.prices[priceKey];
  console.log("priceId", priceId);
  if (!priceId) {
    throw new Error(
      `Price ID not found for product "${productKey}" and price "${priceKey}"`
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
    client_reference_id: userId,
  });

  return session.url!;
}
