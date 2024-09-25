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

export interface SRMPrice {
  readonly amount: number;
  readonly interval: "day" | "week" | "month" | "year";
}
