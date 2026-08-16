import { useCallback, useEffect, useState } from "react"

import type { PortfolioResponse } from "../../shared/types"

interface UsePortfolio {
  data: PortfolioResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePortfolio(): UsePortfolio {
  const [data, setData] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let finished = false

    fetch("/api/portfolio", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        return (await res.json()) as PortfolioResponse
      })
      .then((portfolio) => {
        if (finished) return
        setData(portfolio)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (finished || controller.signal.aborted) return
        console.error("[usePortfolio] fetch failed:", err)
        setError(err instanceof Error ? err.message : "Failed to load portfolio")
        setLoading(false)
      })

    return () => {
      finished = true
      controller.abort()
    }
  }, [reloadKey])

  const refetch = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  return { data, loading, error, refetch }
}
