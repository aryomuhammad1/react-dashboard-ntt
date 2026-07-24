import { useCallback, useEffect, useMemo } from 'react'
import { useProductStore } from '@/stores/productStore'
import type { ProductQuery } from '@/types'

export const useProductList = (query: ProductQuery) => {
  const items = useProductStore((state) => state.items)
  const pinned = useProductStore((state) => state.pinned)
  const total = useProductStore((state) => state.total)
  const isLoading = useProductStore((state) => state.isLoading)
  const error = useProductStore((state) => state.error)
  const fetchList = useProductStore((state) => state.fetchList)

  const { q, category, sortBy, order, page, limit } = query

  useEffect(() => {
    fetchList({ q, category, sortBy, order, page, limit })
  }, [fetchList, q, category, sortBy, order, page, limit])

  const rows = useMemo(() => [...pinned, ...items], [pinned, items])
  const pinnedIds = useMemo(() => new Set(pinned.map((product) => product.id)), [pinned])

  const refetch = useCallback(() => {
    fetchList({ q, category, sortBy, order, page, limit })
  }, [fetchList, q, category, sortBy, order, page, limit])

  return { rows, pinnedIds, total, isLoading, error, refetch }
}
