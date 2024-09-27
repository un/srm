export interface PreSRMConfig {
  readonly features: Record<string, string>;
  readonly products: Record<string, SRMProduct>;
}

export interface SRMProduct {
  readonly name: string;
  readonly id: string; // Added 'id'
  readonly prices: Record<string, SRMPrice>; // Added 'prices'
  readonly features: readonly string[]; // Changed to readonly

}

export type SRMPrice = RecurringSRMPrice | OneTimeSRMPrice;

export interface RecurringSRMPrice {
  readonly amount: number;
  readonly interval: "day" | "week" | "month" | "year" | "one_time";
  readonly type: "recurring";
}

export interface OneTimeSRMPrice {
  readonly amount: number;
  readonly interval: "day" | "week" | "month" | "year" | "one_time";
  readonly type: "one_time";
}

export interface CheckoutUrlParams {
  userId: string;
  successUrl: string;
  cancelUrl: string;
}
