import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useProductStore } from '@/stores/productStore'
import type { Product, ProductFormValues } from '@/types'

export const useUpdateProduct = () => {
  const updateProduct = useProductStore((state) => state.updateProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (id: number, values: ProductFormValues): Promise<Product | null> => {
      setIsSubmitting(true)
      try {
        const product = await updateProduct(id, values)
        toast.success(`Produk "${product.title}" berhasil diperbarui.`)
        return product
      } catch {
        toast.error('Gagal memperbarui produk. Silakan coba lagi.')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [updateProduct],
  )

  return { submit, isSubmitting }
}
