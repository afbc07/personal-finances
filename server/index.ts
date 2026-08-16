import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"

import { getQuotes } from "./finnhub"
import { computePortfolio, loadStocksFile } from "./portfolio"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STOCKS_FILE = path.resolve(__dirname, "..", "stocks.yml")
const DIST_DIR = path.resolve(__dirname, "..", "dist")

const app = express()

app.get("/api/portfolio", async (_req, res) => {
  try {
    const source = loadStocksFile(STOCKS_FILE)
    const tickers = (source.stocks ?? []).map((s) => s.ticker)
    const prices = await getQuotes(tickers)
    res.json(computePortfolio(source, prices))
  } catch (err) {
    console.error("[api] /api/portfolio failed:", err)
    res.status(500).json({ error: "Failed to load portfolio" })
  }
})

const isProduction = process.env.NODE_ENV === "production" || existsSync(DIST_DIR)
if (isProduction) {
  app.use(express.static(DIST_DIR))
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"))
  })
}

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`)
})
