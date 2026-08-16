import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { SummaryCards } from "@/components/SummaryCards"
import { StocksGrid } from "@/components/StocksGrid"
import { usePortfolio } from "@/hooks/usePortfolio"

export function App() {
  const { data, loading, error, refetch } = usePortfolio()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">
          {data?.title ?? "Stock Portfolio"}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={loading ? "animate-spin" : undefined} />
          Refresh
        </Button>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load portfolio: {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-2 pt-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        data && (
          <>
            <SummaryCards summary={data.summary} currency={data.currency} />
            <StocksGrid stocks={data.stocks} currency={data.currency} />
          </>
        )
      )}
    </div>
  )
}

export default App
