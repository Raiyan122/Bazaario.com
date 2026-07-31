import { CurrencyCode, CurrencyInfo } from '../types';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 119.5 },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 278.0 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 16180.0 },
};

export function formatPrice(amountUSD: number, currencyCode: CurrencyCode = 'USD'): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const converted = amountUSD * currency.rate;
  
  if (currencyCode === 'IDR') {
    return `${currency.symbol} ${Math.round(converted).toLocaleString('en-US')}`;
  }
  if (currencyCode === 'BDT' || currencyCode === 'PKR') {
    return `${currency.symbol} ${Math.round(converted).toLocaleString('en-US')}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}

export function calculateDiscountedPrice(basePriceUSD: number, discountPercent?: number): number {
  if (!discountPercent || discountPercent <= 0) return basePriceUSD;
  return Number((basePriceUSD * (1 - discountPercent / 100)).toFixed(2));
}
