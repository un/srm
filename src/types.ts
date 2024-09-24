export interface SRMConfig {
  products: { [key: string]: SRMProduct };
  features: { [key: string]: string };
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
