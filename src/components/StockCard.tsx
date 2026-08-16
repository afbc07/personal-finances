import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { formatCurrency, formatPercent, trendClass } from "@/lib/format"
import type { StockDto } from "../../shared/types"

interface StockCardProps {
  stock: StockDto
  currency: string
  onMore: (stock: StockDto) => void
}

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium tabular-nums">{value}</div>
    </div>
  )
}

export function StockCard({ stock, currency, onMore }: StockCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{stock.tickerAndName}</CardTitle>
        <CardDescription>{stock.area}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => onMore(stock)}>
            More
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Stat label="Amount" value={String(stock.amount)} />
          <Stat label="Investment" value={formatCurrency(stock.investment, currency)} />
          <Stat label="Price" value={formatCurrency(stock.stockPrice, currency)} />
          <Stat label="Total" value={formatCurrency(stock.total, currency)} />
          <Stat
            label="% Portfolio"
            value={formatPercent(stock.percentage)}
            className={trendClass(stock.percentage)}
          />
          <Stat
            label="Revenue"
            value={formatCurrency(stock.revenue, currency)}
            className={trendClass(stock.revenue)}
          />
          <Stat
            label="Revenue %"
            value={formatPercent(stock.revenuePercentage)}
            className={trendClass(stock.revenuePercentage)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
