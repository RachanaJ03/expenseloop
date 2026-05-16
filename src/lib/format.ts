import { getCurrency } from "./currencies";

export function formatMoney(amount: number, currencyCode: string) {
  const c = getCurrency(currencyCode);
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${c.symbol}${amount.toFixed(2)}`;
  }
}
