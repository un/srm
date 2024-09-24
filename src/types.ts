export interface SRMConfig {
  features: Record<string, string>;
  products: Record<string, {
    name: string;
    prices: Record<string, {
      amount: number;
      interval: 'month' | 'year';
    }>;
    features: string[];
  }>;
}

export interface SRMProduct {
  name: string;
  prices: { [key: string]: SRMPrice };
  features: string[];
}

export interface SRMPrice {
  amount: number;
  interval: 'day' | 'week' | 'month' | 'year';
}

export interface PriceConfig {
  amount: number;
  interval: 'day' | 'week' | 'month' | 'year';
}

export interface ProductConfig {
  name: string;
  prices: { [key: string]: PriceConfig };
  features: string[];
}
