import { EyeIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable } from '@/components/ui/data-table'
import type { Column } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductThumbnail } from '@/features/products/components/ProductThumbnail'
import { useDeleteProduct } from '@/hooks/mutations/useDeleteProduct'
import { useCategories } from '@/hooks/queries/useCategories'
import { useProductList } from '@/hooks/queries/useProductList'
import { useProductQuery } from '@/hooks/useProductQuery'
import { formatCategory, formatCurrency, formatRating } from '@/lib/format'
import type { Product } from '@/types'

const stockVariant = (stock: number) => {
  if (stock === 0) return 'destructive' as const
  if (stock < 20) return 'secondary' as const
  return 'outline' as const
}

export const ProductListPage = () => {
  const navigate = useNavigate()
  const { query, setQuery, toggleSort, resetQuery, hasActiveFilters } = useProductQuery()

  const categories = useCategories()
  const { rows, pinnedIds, total, isLoading, error, refetch } = useProductList(query)
  const { remove, isDeleting } = useDeleteProduct()

  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const { page, limit, sortBy, order } = query

  const handleDelete = async () => {
    if (!productToDelete) return

    const isSuccess = await remove(productToDelete)
    if (!isSuccess) return

    setProductToDelete(null)
    refetch()
  }

  const columns: Column<Product>[] = [
    {
      key: 'title',
      header: 'Produk',
      sortField: 'title',
      width: '32%',
      render: (product) => (
        <div className="flex items-center gap-3">
          <ProductThumbnail src={product.thumbnail} alt={product.title} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/products/${product.id}`}
                className="truncate font-semibold transition-colors hover:text-pru-red"
              >
                {product.title}
              </Link>
              {pinnedIds.has(product.id) && (
                <Badge className="bg-pru-red-100 text-pru-red-dark">Baru</Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{product.brand ?? 'Tanpa brand'}</p>
          </div>
        </div>
      ),
      renderSkeleton: () => (
        <div className="flex items-center gap-3">
          <Skeleton className="size-11" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (product) => <Badge variant="secondary">{formatCategory(product.category)}</Badge>,
      renderSkeleton: () => <Skeleton className="h-5 w-24 rounded-full" />,
    },
    {
      key: 'price',
      header: 'Harga',
      sortField: 'price',
      align: 'right',
      render: (product) => <span className="font-semibold">{formatCurrency(product.price)}</span>,
      renderSkeleton: () => <Skeleton className="ml-auto h-4 w-16" />,
    },
    {
      key: 'rating',
      header: 'Rating',
      sortField: 'rating',
      align: 'right',
      render: (product) => formatRating(product.rating),
      renderSkeleton: () => <Skeleton className="ml-auto h-4 w-10" />,
    },
    {
      key: 'stock',
      header: 'Stok',
      sortField: 'stock',
      align: 'right',
      render: (product) => <Badge variant={stockVariant(product.stock)}>{product.stock}</Badge>,
      renderSkeleton: () => <Skeleton className="ml-auto h-5 w-12 rounded-full" />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      width: '140px',
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(`/products/${product.id}`)}
            aria-label={`Lihat detail ${product.title}`}
          >
            <EyeIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(`/products/${product.id}/edit`)}
            aria-label={`Ubah ${product.title}`}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setProductToDelete(product)}
            aria-label={`Hapus ${product.title}`}
            className="hover:bg-pru-red-100 hover:text-pru-red"
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
      renderSkeleton: () => <Skeleton className="ml-auto h-4 w-20" />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Produk"
        description="Cari, urutkan, dan kelola seluruh produk yang tersedia."
        actions={
          <Button asChild>
            <Link to="/products/new">
              <PlusIcon />
              Tambah Produk
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <ProductFilters
          query={query}
          categories={categories}
          hasActiveFilters={hasActiveFilters}
          onQueryChange={setQuery}
          onReset={resetQuery}
        />

        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(product) => product.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          sortBy={sortBy}
          order={order}
          onSortChange={toggleSort}
          skeletonRows={limit}
          emptyState={
            <EmptyState
              icon={SearchIcon}
              title="Produk tidak ditemukan"
              description={
                hasActiveFilters
                  ? 'Tidak ada produk yang cocok dengan filter Anda. Coba kata kunci atau kategori lain.'
                  : 'Belum ada produk yang tersedia saat ini.'
              }
            />
          }
        />

        {!isLoading && !error && rows.length > 0 && (
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={(nextPage) => setQuery({ page: nextPage })}
          />
        )}
      </Card>

      <ConfirmDialog
        isOpen={productToDelete !== null}
        title="Hapus produk ini?"
        description={`"${productToDelete?.title ?? ''}" akan dihapus dari daftar produk Anda.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  )
}
