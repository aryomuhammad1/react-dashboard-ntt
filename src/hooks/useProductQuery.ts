import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SORTABLE_FIELDS } from '@/types'
import type { ProductQuery, SortField, SortOrder } from '@/types'

export const PAGE_SIZE = 10

const DEFAULT_QUERY: ProductQuery = {
  q: '',
  category: '',
  sortBy: '',
  order: 'asc',
  page: 1,
  limit: PAGE_SIZE,
}

const parseSortBy = (value: string | null): SortField | '' => {
  return SORTABLE_FIELDS.includes(value as SortField) ? (value as SortField) : ''
}

const parseOrder = (value: string | null): SortOrder => {
  return value === 'desc' ? 'desc' : 'asc'
}

const parsePage = (value: string | null): number => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_QUERY.page
}

const serialize = (query: ProductQuery) => {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.category) params.set('category', query.category)
  if (query.sortBy) {
    params.set('sortBy', query.sortBy)
    if (query.order !== DEFAULT_QUERY.order) params.set('order', query.order)
  }
  if (query.page !== DEFAULT_QUERY.page) params.set('page', String(query.page))
  return params
}

interface SetQueryOptions {
  replace?: boolean
}

export const useProductQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = useMemo<ProductQuery>(() => {
    const sortBy = parseSortBy(searchParams.get('sortBy'))
    return {
      q: searchParams.get('q') ?? DEFAULT_QUERY.q,
      category: searchParams.get('category') ?? DEFAULT_QUERY.category,
      sortBy,
      order: sortBy ? parseOrder(searchParams.get('order')) : DEFAULT_QUERY.order,
      page: parsePage(searchParams.get('page')),
      limit: PAGE_SIZE,
    }
  }, [searchParams])

  const setQuery = useCallback(
    (patch: Partial<ProductQuery>, options: SetQueryOptions = {}) => {
      const next: ProductQuery = {
        ...query,
        ...patch,
        page: 'page' in patch ? (patch.page ?? DEFAULT_QUERY.page) : DEFAULT_QUERY.page,
      }
      setSearchParams(serialize(next), { replace: options.replace ?? false })
    },
    [query, setSearchParams],
  )

  const toggleSort = useCallback(
    (field: string) => {
      const sortField = parseSortBy(field)
      if (!sortField) return

      if (query.sortBy !== sortField) {
        setQuery({ sortBy: sortField, order: 'asc' })
        return
      }

      if (query.order === 'asc') {
        setQuery({ sortBy: sortField, order: 'desc' })
        return
      }

      setQuery({ sortBy: '', order: 'asc' })
    },
    [query.sortBy, query.order, setQuery],
  )

  const resetQuery = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false })
  }, [setSearchParams])

  const hasActiveFilters = Boolean(query.q || query.category || query.sortBy)

  return { query, setQuery, toggleSort, resetQuery, hasActiveFilters }
}
