import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useCreateProduct } from '@/hooks/mutations/useCreateProduct'
import { useCategories } from '@/hooks/queries/useCategories'
import type { ProductFormValues } from '@/types'

export const ProductCreatePage = () => {
  const navigate = useNavigate()
  const categories = useCategories()
  const { submit, isSubmitting } = useCreateProduct()

  const handleSubmit = async (values: ProductFormValues) => {
    const product = await submit(values)
    if (product) navigate(`/products/${product.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Tambah Produk"
        description="Lengkapi informasi di bawah untuk menambahkan produk baru."
        backTo="/products"
        backLabel="Kembali ke daftar produk"
      />

      <Card className="py-0">
        <ProductForm
          mode="create"
          categories={categories}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/products')}
        />
      </Card>
    </div>
  )
}
