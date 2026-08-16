const TTL_MS = 45_000
const BASE_URL = "https://finnhub.io/api/v1/quote"

interface CacheEntry {
  price: number | null
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
let warnedMissingKey = false

interface QuoteResponse {
  c?: number
}

/** Fetch a single ticker's current price from Finnhub. Returns null on any failure. */
async function fetchPrice(ticker: string, token: string): Promise<number | null> {
  const url = `${BASE_URL}?symbol=${encodeURIComponent(ticker)}&token=${encodeURIComponent(token)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as QuoteResponse
  if (typeof data.c !== "number" || data.c === 0) return null
  return data.c
}

/**
 * Current prices for the given tickers, caching each for ~45s to stay well under
 * Finnhub rate limits when multiple users load at once.
 */
export async function getQuotes(
  tickers: string[],
): Promise<Map<string, number | null>> {
  const token = process.env.FINNHUB_API_KEY
  if (!token) {
    if (!warnedMissingKey) {
      console.warn(
        "[finnhub] FINNHUB_API_KEY is not set — prices will show N/A",
      )
      warnedMissingKey = true
    }
    return new Map(tickers.map((t) => [t, null]))
  }

  const now = Date.now()
  const result = new Map<string, number | null>()
  const missing: string[] = []

  for (const ticker of tickers) {
    const entry = cache.get(ticker)
    if (entry && entry.expiresAt > now) {
      result.set(ticker, entry.price)
    } else {
      missing.push(ticker)
    }
  }

  await Promise.allSettled(
    missing.map(async (ticker) => {
      const price = await fetchPrice(ticker, token)
      cache.set(ticker, { price, expiresAt: Date.now() + TTL_MS })
      result.set(ticker, price)
    }),
  )

  return result
}
