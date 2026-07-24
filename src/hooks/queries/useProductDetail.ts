import { useCallback, useEffect } from 'react'
import { useProductStore } from '@/stores/productStore'

export const useProductDetail = (productId: number) => {
  const detail = useProductStore((state) => state.detail)
  const isLoading = useProductStore((state) => state.isDetailLoading)
  const error = useProductStore((state) => state.detailError)
  const fetchDetail = useProductStore((state) => state.fetchDetail)

  useEffect(() => {
    if (Number.isInteger(productId)) fetchDetail(productId)
  }, [fetchDetail, productId])

  const refetch = useCallback(() => {
    fetchDetail(productId)
  }, [fetchDetail, productId])

  return { detail, isLoading, error, refetch }
}
