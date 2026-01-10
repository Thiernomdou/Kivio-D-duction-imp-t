/**
 * Currency Converter
 * Converts amounts from various currencies to EUR
 * XOF (West African CFA Franc) has a fixed rate pegged to EUR
 * Other currencies use exchange rates from an API
 */

// Fixed exchange rate for XOF (pegged to EUR)
// 1 EUR = 655.957 XOF
const XOF_FIXED_RATE = 655.957;

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// In-memory cache for exchange rates
interface RateCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

let rateCache: RateCache | null = null;

export interface ConversionResult {
  amountEur: number;
  exchangeRate: number;
  currency: string;
}

/**
 * Fetches exchange rates from an external API
 * Uses exchangerate-api.com (free tier available)
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Check cache first
  if (rateCache && Date.now() - rateCache.fetchedAt < CACHE_DURATION_MS) {
    console.log("[CurrencyConverter] Using cached rates");
    return rateCache.rates;
  }

  try {
    // Using exchangerate-api.com free endpoint
    // Alternative: https://api.exchangerate.host/latest?base=EUR
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/EUR",
      {
        next: { revalidate: CACHE_DURATION_MS / 1000 }, // Cache for Next.js
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the rates
    rateCache = {
      rates: data.rates,
      fetchedAt: Date.now(),
    };

    console.log("[CurrencyConverter] Fetched fresh rates");
    return data.rates;
  } catch (error) {
    console.error("[CurrencyConverter] Failed to fetch rates:", error);

    // Return cached rates if available, even if expired
    if (rateCache) {
      console.log("[CurrencyConverter] Using stale cache as fallback");
      return rateCache.rates;
    }

    // Return common fixed rates as fallback
    return {
      USD: 1.08,
      GBP: 0.86,
      XOF: XOF_FIXED_RATE,
      XAF: XOF_FIXED_RATE, // Central African CFA Franc (same rate as XOF)
      MAD: 10.8, // Moroccan Dirham
      TND: 3.4, // Tunisian Dinar
      DZD: 145.5, // Algerian Dinar
    };
  }
}

/**
 * Gets the exchange rate for a currency to EUR
 * XOF and XAF use fixed rates (pegged to EUR)
 */
export async function getExchangeRate(currency: string): Promise<number> {
  const upperCurrency = currency.toUpperCase();

  // EUR to EUR is always 1
  if (upperCurrency === "EUR") {
    return 1;
  }

  // XOF and XAF have fixed rates pegged to EUR
  if (upperCurrency === "XOF" || upperCurrency === "XAF") {
    return XOF_FIXED_RATE;
  }

  // Fetch rates for other currencies
  const rates = await fetchExchangeRates();
  return rates[upperCurrency] || 1;
}

/**
 * Converts an amount from any currency to EUR
 * @param amount - The amount to convert
 * @param currency - The source currency code (e.g., "XOF", "USD")
 * @returns Conversion result with EUR amount and rate used
 */
export async function convertToEUR(
  amount: number,
  currency: string
): Promise<ConversionResult> {
  if (!amount || amount <= 0) {
    return {
      amountEur: 0,
      exchangeRate: 1,
      currency: currency || "EUR",
    };
  }

  const upperCurrency = currency?.toUpperCase() || "EUR";

  // No conversion needed for EUR
  if (upperCurrency === "EUR") {
    return {
      amountEur: amount,
      exchangeRate: 1,
      currency: "EUR",
    };
  }

  const exchangeRate = await getExchangeRate(upperCurrency);

  // Convert: amount / rate = EUR amount
  // e.g., 6559.57 XOF / 655.957 = 10 EUR
  const amountEur = Math.round((amount / exchangeRate) * 100) / 100;

  return {
    amountEur,
    exchangeRate,
    currency: upperCurrency,
  };
}

/**
 * Formats an amount with currency symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currency: string = "EUR"
): string {
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  try {
    return formatter.format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Common currency codes used in African transfers
 */
export const COMMON_CURRENCIES = {
  EUR: { name: "Euro", symbol: "€" },
  XOF: { name: "Franc CFA (BCEAO)", symbol: "CFA" },
  XAF: { name: "Franc CFA (BEAC)", symbol: "CFA" },
  USD: { name: "Dollar américain", symbol: "$" },
  GBP: { name: "Livre sterling", symbol: "£" },
  MAD: { name: "Dirham marocain", symbol: "DH" },
  TND: { name: "Dinar tunisien", symbol: "DT" },
  DZD: { name: "Dinar algérien", symbol: "DA" },
} as const;
