import { readFileSync } from "node:fs"
import { parse } from "yaml"

import type { MovementDto, PortfolioResponse, StockDto } from "../shared/types"

interface MovementSource {
  date: string | Date
  amount: number
  price: number
}

interface StockSource {
  ticker: string
  name: string
  sector?: string
  movements?: MovementSource[]
}

interface PortfolioSource {
  title?: string
  currency?: string
  stocks?: StockSource[]
}

/** Normalize a YAML date (Date object or YYYY-M-D string) to zero-padded YYYY-MM-DD. */
function normalizeDate(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, "0")
    const d = String(value.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
  if (!match) return value
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`
}

/** Load and parse stocks.yml from disk. Throws if the file is missing or malformed. */
export function loadStocksFile(path: string): PortfolioSource {
  const raw = readFileSync(path, "utf8")
  return parse(raw) as PortfolioSource
}

/**
 * Compute the full portfolio response from the parsed yml and live prices.
 * Prices not found (null) keep the stock's static data but mark price-dependent
 * fields as N/A.
 */
export function computePortfolio(
  source: PortfolioSource,
  prices: Map<string, number | null>,
): PortfolioResponse {
  const stocks: StockDto[] = (source.stocks ?? []).map((stock) => {
    const movements: MovementDto[] = (stock.movements ?? []).map((m) => ({
      date: normalizeDate(m.date),
      amount: m.amount,
      price: m.price,
    }))
    movements.sort((a, b) => b.date.localeCompare(a.date))

    const amount = movements.reduce((sum, m) => sum + m.amount, 0)
    const investment = movements.reduce((sum, m) => sum + m.price, 0) // literal spec
    const stockPrice = prices.get(stock.ticker) ?? null
    const total = stockPrice === null ? null : amount * stockPrice

    return {
      ticker: stock.ticker,
      name: stock.name,
      tickerAndName: `${stock.ticker} — ${stock.name}`,
      area: stock.sector ?? "",
      amount,
      investment,
      stockPrice,
      total,
      percentage: null, // filled in after totalBalance is known
      revenue: total === null ? null : total - investment,
      revenuePercentage:
        total === null || investment === 0
          ? null
          : (total - investment) / investment,
      movements,
    }
  })

  const pricedTotals = stocks.filter((s) => s.total !== null).map((s) => s.total!)
  const totalBalance = pricedTotals.length > 0 ? pricedTotals.reduce((a, b) => a + b, 0) : null
  const totalInvestment = stocks.reduce((sum, s) => sum + s.investment, 0)

  for (const stock of stocks) {
    if (stock.total !== null && totalBalance !== null && totalBalance !== 0) {
      stock.percentage = stock.total / totalBalance
    }
  }

  return {
    title: source.title ?? "My Stocks",
    currency: source.currency ?? "USD",
    summary: {
      totalBalance,
      totalInvestment,
      totalPercentage:
        totalBalance === null || totalInvestment === 0
          ? null
          : (totalBalance - totalInvestment) / totalInvestment,
    },
    stocks,
  }
}
