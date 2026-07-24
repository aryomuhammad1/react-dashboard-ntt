import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatCategory } from '@/lib/format'
import type { ProductQuery } from '@/types'

const ALL_CATEGORIES = 'all'

interface ProductFiltersProps {
  query: ProductQuery
  categories: string[]
  hasActiveFilters: boolean
  onQueryChange: (patch: Partial<ProductQuery>, options?: { replace?: boolean }) => void
  onReset: () => void
}

export const ProductFilters = ({
  query,
  categories,
  hasActiveFilters,
  onQueryChange,
  onReset,
}: ProductFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(query.q)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 400)

  useEffect(() => {
    setSearchTerm(query.q)
  }, [query.q])

  useEffect(() => {
    if (debouncedSearchTerm === query.q) return
    onQueryChange({ q: debouncedSearchTerm }, { replace: true })
  }, [debouncedSearchTerm, query.q, onQueryChange])

  return (
    <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
      <div className="relative min-w-56 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Cari produk berdasarkan nama, brand, atau deskripsi..."
          aria-label="Cari produk"
          className="h-10 pr-9 pl-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setSearchTerm('')}
            aria-label="Hapus pencarian"
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <XIcon />
          </Button>
        )}
      </div>

      <Select
        value={query.category || ALL_CATEGORIES}
        onValueChange={(value) => onQueryChange({ category: value === ALL_CATEGORIES ? '' : value })}
      >
        <SelectTrigger className="h-10 w-full sm:w-52" aria-label="Filter kategori">
          <SelectValue placeholder="Semua Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES}>Semua Kategori</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {formatCategory(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <XIcon />
          Reset
        </Button>
      )}
    </div>
  )
}
