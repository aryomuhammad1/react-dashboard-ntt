import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useUpdateProduct } from '@/hooks/mutations/useUpdateProduct'
import { useCategories } from '@/hooks/queries/useCategories'
import { useProductDetail } from '@/hooks/queries/useProductDetail'
import type { ProductFormValues } from '@/types'

const EditFormSkeleton = () => (
  <div className="flex flex-col gap-5 p-5">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-24 w-full" />
    <div className="grid gap-5 sm:grid-cols-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="grid gap-5 sm:grid-cols-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
)

export const ProductEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const productId = Number(id)

  const categories = useCategories()
  const { detail, isLoading, error, refetch } = useProductDetail(productId)
  const { submit, isSubmitting } = useUpdateProduct()

  const handleSubmit = async (values: ProductFormValues) => {
    const product = await submit(productId, values)
    if (product) navigate(`/products/${productId}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ubah Produk"
        description={detail ? detail.title : 'Memuat data produk...'}
        backTo={`/products/${productId}`}
        backLabel="Kembali ke detail produk"
      />

      <Card className="py-0">
        {isLoading ? (
          <EditFormSkeleton />
        ) : error || !detail ? (
          <ErrorState
            title="Produk tidak ditemukan"
            message={error ?? 'Produk yang ingin Anda ubah tidak tersedia.'}
            onRetry={refetch}
          />
        ) : (
          <ProductForm
            mode="edit"
            categories={categories}
            isSubmitting={isSubmitting}
            initialValues={{
              title: detail.title,
              description: detail.description,
              category: detail.category,
              price: detail.price,
              discountPercentage: detail.discountPercentage,
              stock: detail.stock,
              brand: detail.brand ?? '',
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/products/${productId}`)}
          />
        )}
      </Card>
    </div>
  )
}
