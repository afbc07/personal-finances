import { useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { StockDto } from "../../shared/types"
import { MovementsModal } from "./MovementsModal"
import { StockCard } from "./StockCard"

type SortKey =
  | "tickerAndName"
  | "area"
  | "amount"
  | "investment"
  | "total"
  | "percentage"
  | "revenue"
  | "revenuePercentage"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "tickerAndName", label: "Stock" },
  { key: "area", label: "Area" },
  { key: "amount", label: "Amount" },
  { key: "investment", label: "Investment" },
  { key: "total", label: "Total" },
  { key: "percentage", label: "% Portfolio" },
  { key: "revenue", label: "Revenue" },
  { key: "revenuePercentage", label: "Revenue %" },
]

function sortValue(stock: StockDto, key: SortKey): string | number {
  const value = stock[key]
  return value === null ? Number.NEGATIVE_INFINITY : value
}

interface StocksGridProps {
  stocks: StockDto[]
  currency: string
}

export function StocksGrid({ stocks, currency }: StocksGridProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDesc, setSortDesc] = useState(false)
  const [selected, setSelected] = useState<StockDto | null>(null)

  const sorted = [...stocks]
  if (sortKey) {
    sorted.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDesc ? -cmp : cmp
    })
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((d) => !d)
    } else {
      setSortKey(key)
      setSortDesc(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by</span>
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.key}
            variant={sortKey === option.key ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleSort(option.key)}
          >
            {option.label}
            {sortKey === option.key ? (
              sortDesc ? (
                <ArrowDown className="size-3.5" />
              ) : (
                <ArrowUp className="size-3.5" />
              )
            ) : (
              <ChevronsUpDown className="size-3.5 opacity-50" />
            )}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((stock) => (
          <StockCard
            key={stock.ticker}
            stock={stock}
            currency={currency}
            onMore={setSelected}
          />
        ))}
      </div>
      <MovementsModal
        stock={selected}
        currency={currency}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
