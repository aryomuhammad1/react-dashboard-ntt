import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useProductStore } from '@/stores/productStore'
import type { Product } from '@/types'

export const useDeleteProduct = () => {
  const removeProduct = useProductStore((state) => state.removeProduct)
  const [isDeleting, setIsDeleting] = useState(false)

  const remove = useCallback(
    async (product: Product): Promise<boolean> => {
      setIsDeleting(true)
      try {
        await removeProduct(product)
        toast.success(`Produk "${product.title}" berhasil dihapus.`)
        return true
      } catch {
        toast.error('Gagal menghapus produk. Silakan coba lagi.')
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [removeProduct],
  )

  return { remove, isDeleting }
}
