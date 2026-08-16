# Stock Portfolio Monitor

A web application to monitor a personal stock portfolio. Reads holdings from [`stocks.yml`](./stocks.yml) and fetches live prices from the [Finnhub API](https://finnhub.io/).

- **React + TypeScript + Vite + shadcn/ui** frontend
- **Express** backend that reads `stocks.yml` from the filesystem and proxies all Finnhub calls
- The Finnhub API key lives in a server-side environment variable and is never exposed to the client

## Architecture

```
browser ── GET /api/portfolio ──> Express server (server/)
                                   ├── reads stocks.yml (fresh on every request)
                                   ├── fetches live prices from Finnhub /quote (45s cache)
                                   └── returns computed portfolio (summary + stocks + movements)
```

- The backend reads `stocks.yml` from the local filesystem — it is never fetched client-side.
- The backend proxies all Finnhub API calls. The key is read from `FINNHUB_API_KEY` on the server.
- The frontend calls `GET /api/portfolio` once and renders the fully computed summary + stock list + live prices.

In development, Vite proxies `/api` → `http://localhost:3001`. In production, Express serves the built frontend from `dist/`.

## Getting started

```bash
npm install
cp .env.example .env   # then add your FINNHUB_API_KEY
npm run dev            # Vite (web) + Express (api) via concurrently
```

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/portfolio
- Production build: `npm run build && npm run start` (serves `dist/` on port 3001, `PORT` env to override)

## Data source — `stocks.yml`

```yaml
title: My Stocks
currency: USD
stocks:
  - ticker: JNJ
    name: Johnson & Johnson
    sector: Salud - Farmacéutica
    movements:
      - date: 2025-10-15
        amount: 10
        price: 120
```

Dates may be `YYYY-M-D` (unpadded); they are normalized to `YYYY-MM-DD` in the response.

## Data model & formulas

### Summary (portfolio-level)

- `TotalBalance` — sum of every stock's `Total`
- `TotalInvestment` — sum of every stock's `Investment`
- `TotalPercentage` — `(TotalBalance - TotalInvestment) / TotalInvestment`

### Per stock

- `TickerAndName` — `"{ticker} — {name}"`
- `Amount` — sum of `movements[].amount`
- `Investment` — sum of all `movements[].price` values
- `StockPrice` — current price from Finnhub `/quote` (field `c`)
- `Total` — `Amount * StockPrice`
- `Percentage` — this stock's `Total` ÷ portfolio `TotalBalance`
- `Area` — the `sector` field from the stock's yml entry
- `Revenue` — `Total - Investment`
- `RevenuePercentage` — `(Total - Investment) / Investment`

### Movement modal

The "More" button opens a modal showing the stock's summary fields plus its full movement history (`Date`, `Amount`, `Price`), sorted by date descending.

## Behavior

- **Refresh** — `stocks.yml` and live prices are re-fetched on every page load. Finnhub responses are cached server-side for ~45 seconds to avoid rate limits.
- **Loading state** — static data (ticker, name, amount, investment) renders immediately while prices are still loading.
- **Errors** — if Finnhub fails or a ticker isn't found, that stock's price/total/revenue show "N/A" rather than failing the whole page. Same if `FINNHUB_API_KEY` is not set.
- **Formatting** — currency values to 2 decimals with the currency symbol; percentages with a `%` sign; revenue/percentages colored green when positive, red when negative.
- **Sort order** — stocks listed in `stocks.yml` order by default; click any column header to sort.
- **Empty movements** — a stock with no movements shows zeroed-out values instead of erroring.

## Project structure

```
server/            Express backend
  index.ts         app setup, /api/portfolio route, SPA serving
  portfolio.ts     yml loading + portfolio computations
  finnhub.ts       Finnhub /quote proxy with 45s cache
shared/            shared TypeScript types (server + client)
  types.ts
src/               React frontend
  App.tsx          page shell (loading skeletons, error banner)
  components/      SummaryCards, PortfolioTable, MovementsModal, ui/*
  hooks/           usePortfolio (fetch + refresh)
  lib/             format helpers (currency, percent, trend colors)
stocks.yml         portfolio data source
```

## Environment variables

| Variable          | Required | Description                                       |
| ----------------- | -------- | ------------------------------------------------- |
| `FINNHUB_API_KEY` | Yes      | Finnhub API key (server-side only, never sent to the client) |
| `PORT`            | No       | Backend port (default `3001`)                     |

## Adding components

To add shadcn/ui components, run:

```bash
npx shadcn@latest add button
```

This places them in `src/components/ui`, importable as `@/components/ui/button`.

## Scripts

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Run Vite + Express together (concurrently)         |
| `npm run dev:server`   | Run only the Express backend (watch mode)          |
| `npm run build`        | Typecheck + build the frontend                     |
| `npm run start`        | Build, then serve `dist/` with Express             |
| `npm run typecheck`    | `tsc --noEmit`                                     |
| `npm run lint`         | ESLint                                             |
| `npm run format`       | Prettier                                            |
