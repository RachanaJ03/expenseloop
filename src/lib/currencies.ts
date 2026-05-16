export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", locale: "sv-SE" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", locale: "nb-NO" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", locale: "da-DK" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", locale: "en-HK" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", locale: "es-MX" },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", locale: "ru-RU" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", locale: "ar-SA" },
  { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", locale: "fil-PH" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", locale: "vi-VN" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", locale: "pl-PL" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", locale: "cs-CZ" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", locale: "he-IL" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", locale: "ar-EG" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", locale: "en-PK" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", locale: "bn-BD" },
];

export const getCurrency = (code: string) =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
