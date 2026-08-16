const currencyCache = new Map<string, Intl.NumberFormat>()

/** Format a currency value to 2 decimals with the given currency code. "N/A" for null. */
export function formatCurrency(value: number | null, currency: string): string {
  if (value === null) return "N/A"
  let formatter = currencyCache.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    currencyCache.set(currency, formatter)
  }
  return formatter.format(value)
}

/** Format a ratio (e.g. 0.1234) as a percentage with 1–2 decimals. "N/A" for null. */
export function formatPercent(ratio: number | null): string {
  if (ratio === null) return "N/A"
  return `${(ratio * 100).toFixed(2)}%`
}

/** Text color class for a signed value: green positive, red negative, muted zero/null. */
export function trendClass(value: number | null): string {
  if (value === null) return "text-muted-foreground"
  if (value > 0) return "text-emerald-600 dark:text-emerald-400"
  if (value < 0) return "text-red-600 dark:text-red-400"
  return "text-muted-foreground"
}
