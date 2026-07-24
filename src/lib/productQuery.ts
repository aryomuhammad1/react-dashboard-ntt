import type { Product, ProductQuery, SortField, SortOrder } from '@/types'

export const matchesSearch = (product: Product, term: string) => {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [product.title, product.description, product.brand ?? '', product.category, ...product.tags]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalized)
}

export const matchesCategory = (product: Product, category: string) => {
  if (!category) return true
  return product.category === category
}

export const matchesQuery = (product: Product, query: Pick<ProductQuery, 'q' | 'category'>) => {
  return matchesSearch(product, query.q) && matchesCategory(product, query.category)
}

export const sortProducts = (products: Product[], sortBy: SortField | '', order: SortOrder) => {
  if (!sortBy) return products

  const direction = order === 'desc' ? -1 : 1

  return [...products].sort((a, b) => {
    const left = a[sortBy]
    const right = b[sortBy]

    if (typeof left === 'string' && typeof right === 'string') {
      return left.localeCompare(right) * direction
    }

    return (Number(left) - Number(right)) * direction
  })
}
