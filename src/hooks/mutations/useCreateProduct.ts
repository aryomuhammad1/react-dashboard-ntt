import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useProductStore } from '@/stores/productStore'
import type { Product, ProductFormValues } from '@/types'

export const useCreateProduct = () => {
  const createProduct = useProductStore((state) => state.createProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (values: ProductFormValues): Promise<Product | null> => {
      setIsSubmitting(true)
      try {
        const product = await createProduct(values)
        toast.success(`Produk "${product.title}" berhasil ditambahkan.`)
        return product
      } catch {
        toast.error('Gagal menambahkan produk. Silakan coba lagi.')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [createProduct],
  )

  return { submit, isSubmitting }
}
