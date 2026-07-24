import { PencilIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductThumbnail } from '@/features/products/components/ProductThumbnail'
import { useDeleteProduct } from '@/hooks/mutations/useDeleteProduct'
import { useProductDetail } from '@/hooks/queries/useProductDetail'
import { formatCategory, formatCurrency, formatRating } from '@/lib/format'
import { cn } from '@/lib/utils'

const DetailSkeleton = () => {
  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card className="p-5">
        <Skeleton className="aspect-square w-full" />
        <div className="flex gap-2">
          <Skeleton className="size-16" />
          <Skeleton className="size-16" />
          <Skeleton className="size-16" />
        </div>
      </Card>

      <Card className="p-5">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-7 w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </Card>
    </div>
  )
}

export const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const productId = Number(id)

  const { detail, isLoading, error, refetch } = useProductDetail(productId)
  const { remove, isDeleting } = useDeleteProduct()

  const [activeImage, setActiveImage] = useState(0)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  useEffect(() => {
    setActiveImage(0)
  }, [productId])

  const handleDelete = async () => {
    if (!detail) return

    const isSuccess = await remove(detail)
    if (isSuccess) {
      navigate('/products')
      return
    }

    setIsDeleteOpen(false)
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Detail Produk" backTo="/products" backLabel="Kembali ke daftar produk" />
        <DetailSkeleton />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div>
        <PageHeader title="Detail Produk" backTo="/products" backLabel="Kembali ke daftar produk" />
        <Card className="py-0">
          <ErrorState
            title="Produk tidak ditemukan"
            message={error ?? 'Produk yang Anda cari tidak tersedia.'}
            onRetry={refetch}
          />
        </Card>
      </div>
    )
  }

  const fields = [
    { label: 'Harga', value: formatCurrency(detail.price) },
    { label: 'Diskon', value: `${detail.discountPercentage}%` },
    { label: 'Stok', value: String(detail.stock) },
    { label: 'Brand', value: detail.brand ?? '-' },
  ]

  return (
    <div>
      <PageHeader
        title={detail.title}
        description={formatCategory(detail.category)}
        backTo="/products"
        backLabel="Kembali ke daftar produk"
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/products/${detail.id}/edit`)}>
              <PencilIcon />
              Ubah
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
              className="border-pru-red-200 text-pru-red hover:bg-pru-red-100 hover:text-pru-red-dark"
            >
              <Trash2Icon />
              Hapus
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-card">
            {detail.images.length > 0 ? (
              <img
                src={detail.images[activeImage]}
                alt={detail.title}
                className="size-full object-contain p-4"
              />
            ) : (
              <span className="text-5xl font-bold text-muted-foreground">
                {detail.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {detail.images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {detail.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Lihat gambar ${index + 1}`}
                  className={cn(
                    'rounded border p-1 transition-colors',
                    index === activeImage ? 'border-pru-red' : 'hover:border-muted-foreground',
                  )}
                >
                  <ProductThumbnail src={image} alt={detail.title} className="size-14" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-pru-red-100 text-pru-red-dark">{formatCategory(detail.category)}</Badge>
            <Badge variant={detail.stock === 0 ? 'destructive' : 'outline'}>
              {detail.availabilityStatus}
            </Badge>
            <span className="text-sm text-muted-foreground">Rating {formatRating(detail.rating)}</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">{detail.title}</h2>

          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="flex flex-col">
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {field.label}
                </dt>
                <dd className="mt-0.5 text-base font-semibold">{field.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Deskripsi</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Hapus produk ini?"
        description={`"${detail.title}" akan dihapus dari daftar produk Anda.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  )
}
