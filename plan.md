# Stock Portfolio Monitor

Vite + React dashboard backed by a small Express server. The server reads `stocks.yml`, proxies Finnhub `/quote` calls (key server-side only, 45s TTL cache), and returns a fully computed portfolio in one `GET /api/portfolio` response.

## Key decisions

- **Investment formula**: literal spec — `Investment = Σ movements[].price` (NOT amount × price). Confirmed with user.
- **Backend**: Express (new dep) in `server/`, port 3001, run with `tsx` (new devDep) via `node --watch --import tsx --env-file-if-exists=.env`. Vite proxies `/api` → `localhost:3001` in dev; Express serves `dist/` in production.
- **YAML**: `yaml` package (new dep). Read the file fresh on every `/api/portfolio` request (cheap, satisfies "no stale yml").
- **Date normalization**: AAPL has `2025-10-1`. Normalize any `Date` object or `YYYY-M-D` string to zero-padded `YYYY-MM-DD` before sorting/returning.
- **N/A semantics**: missing price ⇒ that stock's `total`, `percentage`, `revenue`, `revenuePercentage` are `null` (rendered "N/A"). `totalBalance` sums only priced stocks; if none priced, summary balance/percentage are `null`. Division-by-zero (investment = 0, e.g. empty movements) ⇒ percentage fields `null`.

## Data shapes — `shared/types.ts` (new, imported by both server and client)

```ts
interface MovementDto { date: string; amount: number; price: number } // date: YYYY-MM-DD
interface StockDto {
  ticker: string; name: string; tickerAndName: string // "{ticker} — {name}"
  area: string                      // yml `sector`
  amount: number                    // Σ movements.amount
  investment: number                // Σ movements.price  (literal spec)
  stockPrice: number | null         // Finnhub `c`; null = N/A
  total: number | null              // amount * stockPrice
  percentage: number | null         // total / summary.totalBalance
  revenue: number | null            // total - investment
  revenuePercentage: number | null  // (total - investment) / investment
  movements: MovementDto[]          // sorted date DESC
}
interface SummaryDto { totalBalance: number | null; totalInvestment: number; totalPercentage: number | null }
interface PortfolioResponse { title: string; currency: string; summary: SummaryDto; stocks: StockDto[] } // stocks in yml order
```

## Backend (new files)

- `server/index.ts` — Express app: `GET /api/portfolio` (compose parse + quotes + compute); JSON 500 on unexpected error; in production (`NODE_ENV=production` or `dist` exists) serve `dist/` with SPA fallback. Port from `PORT` env, default 3001.
- `server/portfolio.ts` — pure functions: `loadStocksFile(path)` (yaml parse + date normalize), `computePortfolio(yml, prices: Map<string, number|null>) → PortfolioResponse`. Formulas exactly as spec'd above; movements sorted desc; empty movements → zeroed values.
- `server/finnhub.ts` — `getQuotes(tickers: string[]) → Promise<Map<string, number|null>>` via `Promise.allSettled` on `GET https://finnhub.io/api/v1/quote?symbol={t}&token={key}`; use `c`; `c === 0` or request failure ⇒ `null`. In-memory per-ticker cache `{ price, expiresAt }`, TTL 45s. Missing `FINNHUB_API_KEY` ⇒ log warning once, all prices `null` (page still renders static data).

## Frontend

- `src/lib/format.ts` (new) — `formatCurrency(v: number|null, currency)` via `Intl.NumberFormat` (2 decimals, currency code from yml); `formatPercent(ratio|null)` → 1–2 decimals + `%`; `trendClass(v)` → green/red/muted text classes; `"N/A"` for null.
- `src/hooks/usePortfolio.ts` (new) — fetch `/api/portfolio` on mount; `{ data, loading, error, refetch }`.
- `src/components/SummaryCards.tsx` (new) — 3 cards: Total Balance, Total Investment, Total % (trend-colored).
- `src/components/PortfolioTable.tsx` (new) — columns: Stock (TickerAndName), Area, Amount, Investment, Price, Total, % Portfolio, Revenue, Revenue %, More. Click-to-sort headers (default = yml order via original index); "More" opens modal.
- `src/components/MovementsModal.tsx` (new) — shadcn Dialog: summary grid of the stock's fields + movements table (Date, Amount, Price), date desc.
- `src/App.tsx` (rewrite) — page shell renders immediately; skeleton rows + spinner while loading; error banner if the API call itself fails; dark-mode toggle already provided by template.
- shadcn components to add: `npx shadcn@latest add card table dialog skeleton`

## Config changes

- `vite.config.ts` — add `server: { proxy: { "/api": "http://localhost:3001" } }`.
- `package.json` — deps: `express`, `yaml`; devDeps: `tsx`; scripts: `"dev:server": "node --watch --import tsx --env-file-if-exists=.env server/index.ts"`, `"dev": "concurrently -n web,api \"vite\" \"npm:dev:server\""` (add `concurrently` devDep), `"start": "npm run build && node --import tsx --env-file-if-exists=.env server/index.ts"`.
- `tsconfig.node.json` — `include`: add `server/`, `shared/` so `tsc -b` typechecks them.
- `.gitignore` — add `.env`.
- `.env.example` (new) — `FINNHUB_API_KEY=`.

## Verification

1. `npm run typecheck`, `npm run lint`, `npm run build` all pass.
2. `FINNHUB_API_KEY=<key> npm run dev` → UI shows 3 stocks in yml order, summary cards, prices; revenue/percentages green/red.
3. `curl localhost:3001/api/portfolio` → single JSON payload; repeat within 45s → server log shows cache hits (only one Finnhub call per ticker).
4. Error paths: run without `FINNHUB_API_KEY` → static data renders, price/total/revenue show "N/A"; add a bogus ticker to `stocks.yml` → only that row is N/A.
5. Modal: AAPL movements sorted desc (`2025-11-15` before `2025-10-01`), malformed yml date `2025-10-1` rendered as `2025-10-01`.
6. Reload page → fresh fetch (no client caching).
