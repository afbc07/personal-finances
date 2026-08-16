export interface MovementDto {
  date: string // YYYY-MM-DD
  amount: number
  price: number
}

export interface StockDto {
  ticker: string
  name: string
  tickerAndName: string // "{ticker} — {name}"
  area: string // yml `sector`
  amount: number // Σ movements.amount
  investment: number // Σ movements.price (literal spec)
  stockPrice: number | null // Finnhub `c`; null = N/A
  total: number | null // amount * stockPrice
  percentage: number | null // total / summary.totalBalance
  revenue: number | null // total - investment
  revenuePercentage: number | null // (total - investment) / investment
  movements: MovementDto[] // sorted date DESC
}

export interface SummaryDto {
  totalBalance: number | null
  totalInvestment: number
  totalPercentage: number | null
}

export interface PortfolioResponse {
  title: string
  currency: string
  summary: SummaryDto
  stocks: StockDto[] // stocks in yml order
}
