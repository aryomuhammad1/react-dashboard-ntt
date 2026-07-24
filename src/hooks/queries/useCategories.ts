import { useEffect } from 'react'
import { useProductStore } from '@/stores/productStore'

export const useCategories = () => {
  const categories = useProductStore((state) => state.categories)
  const loadCategories = useProductStore((state) => state.loadCategories)

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return categories
}
