import { TaxCode } from './taxCodes';

export interface PreSRMConfig {
  readonly features: Record<string, string>;
  readonly products: Record<string, SRMProduct>;
}

export interface SRMProduct {
  readonly name: string;
  readonly id: string; // Added 'id'
  readonly prices: Record<string, SRMPrice>; // Added 'prices'
  readonly features: readonly string[]; // Changed to readonly
  readonly taxCode?: TaxCode;

}

export interface SRMPriceBase {
  readonly amount: number;
  readonly interval: "day" | "week" | "month" | "year" | "one_time";
  readonly type: "recurring" | "one_time";
}

export interface RecurringSRMPrice extends SRMPriceBase {
  readonly type: "recurring";
}

export interface OneTimeSRMPrice extends SRMPriceBase {
  readonly type: "one_time";
}

export type SRMPrice = RecurringSRMPrice | OneTimeSRMPrice;

export interface CheckoutUrlParams {
  userId: string;
  successUrl: string;
  cancelUrl: string;
}
