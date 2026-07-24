import { apiRequest } from '@/lib/apiClient'
import { matchesSearch, sortProducts } from '@/lib/productQuery'
import type { Product, ProductFormValues, ProductListResponse, ProductQuery } from '@/types'

export interface ProductListResult {
  products: Product[]
  total: number
}

const sortParams = (query: ProductQuery) => {
  if (!query.sortBy) return {}
  return { sortBy: query.sortBy, order: query.order }
}

const fetchSearchWithinCategory = async (query: ProductQuery, signal?: AbortSignal): Promise<ProductListResult> => {
  const response = await apiRequest<ProductListResponse>(`/products/category/${query.category}`, {
    searchParams: { limit: 0 },
    signal,
  })

  const filtered = response.products.filter((product) => matchesSearch(product, query.q))
  const sorted = sortProducts(filtered, query.sortBy, query.order)
  const start = (query.page - 1) * query.limit

  return {
    products: sorted.slice(start, start + query.limit),
    total: filtered.length,
  }
}

export const fetchProducts = async (query: ProductQuery, signal?: AbortSignal): Promise<ProductListResult> => {
  if (query.q && query.category) {
    return fetchSearchWithinCategory(query, signal)
  }

  const searchParams = {
    limit: query.limit,
    skip: (query.page - 1) * query.limit,
    ...sortParams(query),
  }

  if (query.q) {
    const response = await apiRequest<ProductListResponse>('/products/search', {
      searchParams: { ...searchParams, q: query.q },
      signal,
    })
    return { products: response.products, total: response.total }
  }

  if (query.category) {
    const response = await apiRequest<ProductListResponse>(`/products/category/${query.category}`, {
      searchParams,
      signal,
    })
    return { products: response.products, total: response.total }
  }

  const response = await apiRequest<ProductListResponse>('/products', { searchParams, signal })
  return { products: response.products, total: response.total }
}

export const fetchProductById = (id: number, signal?: AbortSignal) => {
  return apiRequest<Product>(`/products/${id}`, { signal })
}

export const fetchCategories = (signal?: AbortSignal) => {
  return apiRequest<string[]>('/products/category-list', { signal })
}

export const createProduct = (values: ProductFormValues) => {
  return apiRequest<Product>('/products/add', { method: 'POST', body: values })
}

export const updateProduct = (id: number, values: ProductFormValues) => {
  return apiRequest<Product>(`/products/${id}`, { method: 'PUT', body: values })
}

export const deleteProduct = (id: number) => {
  return apiRequest<Product & { isDeleted: boolean; deletedOn: string }>(`/products/${id}`, {
    method: 'DELETE',
  })
}
