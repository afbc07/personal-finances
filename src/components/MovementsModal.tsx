import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatCurrency, formatPercent, trendClass } from "@/lib/format"
import type { StockDto } from "../../shared/types"

interface MovementsModalProps {
  stock: StockDto | null
  currency: string
  onClose: () => void
}

export function MovementsModal({ stock, currency, onClose }: MovementsModalProps) {
  return (
    <Dialog open={stock !== null} onOpenChange={(open) => !open && onClose()}>
      {stock && (
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{stock.tickerAndName}</DialogTitle>
            <DialogDescription>{stock.area}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <div className="text-muted-foreground">Amount</div>
              <div>{stock.amount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Investment</div>
              <div>{formatCurrency(stock.investment, currency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Price</div>
              <div>{formatCurrency(stock.stockPrice, currency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total</div>
              <div>{formatCurrency(stock.total, currency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">% Portfolio</div>
              <div className={trendClass(stock.percentage)}>
                {formatPercent(stock.percentage)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Revenue</div>
              <div className={trendClass(stock.revenue)}>
                {formatCurrency(stock.revenue, currency)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Revenue %</div>
              <div className={trendClass(stock.revenuePercentage)}>
                {formatPercent(stock.revenuePercentage)}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 font-medium">Movements</div>
            {stock.movements.length === 0 ? (
              <div className="text-muted-foreground">No movements</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.movements.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{m.date}</TableCell>
                      <TableCell className="text-right">{m.amount}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(m.price, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
