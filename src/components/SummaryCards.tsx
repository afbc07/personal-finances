import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { formatCurrency, formatPercent, trendClass } from "@/lib/format"
import type { SummaryDto } from "../../shared/types"

interface SummaryCardsProps {
  summary: SummaryDto
  currency: string
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {formatCurrency(summary.totalBalance, currency)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Investment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {formatCurrency(summary.totalInvestment, currency)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total %
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-semibold ${trendClass(summary.totalPercentage)}`}
          >
            {formatPercent(summary.totalPercentage)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
