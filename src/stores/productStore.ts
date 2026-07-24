import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ApiError } from '@/lib/apiClient'
import { matchesQuery, sortProducts } from '@/lib/productQuery'
import {
  createProduct as createProductRequest,
  deleteProduct as deleteProductRequest,
  fetchCategories,
  fetchProductById,
  fetchProducts,
  updateProduct as updateProductRequest,
} from '@/features/products/api'
import type { Product, ProductFormValues, ProductQuery } from '@/types'

interface Overlay {
  added: Product[]
  edited: Record<number, Product>
  deleted: Product[]
}

interface ProductState {
  items: Product[]
  pinned: Product[]
  total: number
  isLoading: boolean
  isRefetching: boolean
  error: string | null
  categories: string[]
  detail: Product | null
  isDetailLoading: boolean
  detailError: string | null
  overlay: Overlay
  fetchList: (query: ProductQuery) => Promise<void>
  loadCategories: () => Promise<void>
  fetchDetail: (id: number) => Promise<void>
  createProduct: (values: ProductFormValues) => Promise<Product>
  updateProduct: (id: number, values: ProductFormValues) => Promise<Product>
  removeProduct: (product: Product) => Promise<void>
}

const emptyOverlay: Overlay = { added: [], edited: {}, deleted: [] }

const isAbortError = (error: unknown) => {
  return error instanceof DOMException && error.name === 'AbortError'
}

const toMessage = (error: unknown, fallback: string) => {
  return error instanceof ApiError ? error.message : fallback
}

const buildLocalProduct = (base: Partial<Product>, values: ProductFormValues, id: number): Product => {
  return {
    id,
    title: values.title,
    description: values.description,
    category: values.category,
    price: values.price,
    discountPercentage: values.discountPercentage,
    rating: base.rating ?? 0,
    stock: values.stock,
    tags: base.tags ?? [],
    brand: values.brand || undefined,
    sku: base.sku ?? `LOCAL-${id}`,
    weight: base.weight ?? 0,
    dimensions: base.dimensions ?? { width: 0, height: 0, depth: 0 },
    warrantyInformation: base.warrantyInformation ?? 'Tidak ada garansi',
    shippingInformation: base.shippingInformation ?? 'Dikirim dalam 3-5 hari kerja',
    availabilityStatus: values.stock > 0 ? 'In Stock' : 'Out of Stock',
    reviews: base.reviews ?? [],
    returnPolicy: base.returnPolicy ?? 'Tidak dapat dikembalikan',
    minimumOrderQuantity: base.minimumOrderQuantity ?? 1,
    meta: base.meta ?? {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      barcode: '',
      qrCode: '',
    },
    images: base.images ?? [],
    thumbnail: base.thumbnail ?? '',
  }
}

const nextLocalId = (suggested: number, added: Product[]) => {
  const taken = new Set(added.map((product) => product.id))
  let candidate = suggested
  while (taken.has(candidate)) candidate += 1
  return candidate
}

let listController: AbortController | null = null
let detailController: AbortController | null = null

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      items: [],
      pinned: [],
      total: 0,
      isLoading: true,
      isRefetching: false,
      error: null,
      categories: [],
      detail: null,
      isDetailLoading: true,
      detailError: null,
      overlay: emptyOverlay,

      fetchList: async (query) => {
        listController?.abort()
        const controller = new AbortController()
        listController = controller

        const hasData = get().items.length > 0 || get().pinned.length > 0
        set({ isLoading: !hasData, isRefetching: hasData, error: null })

        try {
          const result = await fetchProducts(query, controller.signal)
          if (controller.signal.aborted) return

          const { added, edited, deleted } = get().overlay
          const deletedIds = new Set(deleted.map((product) => product.id))

          const serverItems = result.products
            .filter((product) => !deletedIds.has(product.id))
            .map((product) => edited[product.id] ?? product)

          const matchingAdded = added.filter((product) => matchesQuery(product, query))
          const matchingDeleted = deleted.filter((product) => matchesQuery(product, query))
          const pinned = query.page === 1 ? sortProducts(matchingAdded, query.sortBy, query.order) : []

          set({
            items: serverItems,
            pinned,
            total: Math.max(0, result.total + matchingAdded.length - matchingDeleted.length),
            isLoading: false,
            isRefetching: false,
          })
        } catch (error) {
          if (isAbortError(error)) return
          set({
            items: [],
            pinned: [],
            total: 0,
            isLoading: false,
            isRefetching: false,
            error: toMessage(error, 'Gagal memuat data produk.'),
          })
        }
      },

      loadCategories: async () => {
        if (get().categories.length > 0) return
        try {
          const categories = await fetchCategories()
          set({ categories })
        } catch {
          set({ categories: [] })
        }
      },

      fetchDetail: async (id) => {
        detailController?.abort()
        const controller = new AbortController()
        detailController = controller

        set({ isDetailLoading: true, detailError: null, detail: null })

        const { added, edited, deleted } = get().overlay

        if (deleted.some((product) => product.id === id)) {
          set({ isDetailLoading: false, detailError: 'Produk ini sudah dihapus.' })
          return
        }

        const local = added.find((product) => product.id === id)
        if (local) {
          set({ detail: local, isDetailLoading: false })
          return
        }

        try {
          const product = await fetchProductById(id, controller.signal)
          if (controller.signal.aborted) return
          set({ detail: edited[product.id] ?? product, isDetailLoading: false })
        } catch (error) {
          if (isAbortError(error)) return
          set({
            isDetailLoading: false,
            detailError: toMessage(error, 'Produk tidak ditemukan.'),
          })
        }
      },

      createProduct: async (values) => {
        const response = await createProductRequest(values)
        const { added } = get().overlay
        const id = nextLocalId(response.id, added)
        const product = buildLocalProduct(response, values, id)

        set((state) => ({
          overlay: { ...state.overlay, added: [product, ...state.overlay.added] },
        }))

        return product
      },

      updateProduct: async (id, values) => {
        const { added, edited } = get().overlay
        const local = added.find((product) => product.id === id)

        if (local) {
          const updated = buildLocalProduct(local, values, id)
          set((state) => ({
            overlay: {
              ...state.overlay,
              added: state.overlay.added.map((product) => (product.id === id ? updated : product)),
            },
          }))
          return updated
        }

        const response = await updateProductRequest(id, values)
        const previous = edited[id] ?? response
        const updated = buildLocalProduct(previous, values, id)

        set((state) => ({
          overlay: { ...state.overlay, edited: { ...state.overlay.edited, [id]: updated } },
          detail: state.detail?.id === id ? updated : state.detail,
        }))

        return updated
      },

      removeProduct: async (product) => {
        const isLocal = get().overlay.added.some((item) => item.id === product.id)

        if (isLocal) {
          set((state) => ({
            overlay: {
              ...state.overlay,
              added: state.overlay.added.filter((item) => item.id !== product.id),
            },
          }))
          return
        }

        await deleteProductRequest(product.id)

        set((state) => {
          const remainingEdits = { ...state.overlay.edited }
          delete remainingEdits[product.id]
          return {
            overlay: {
              added: state.overlay.added,
              edited: remainingEdits,
              deleted: [...state.overlay.deleted, product],
            },
          }
        })
      },
    }),
    {
      name: 'ntt-products',
      partialize: (state) => ({ overlay: state.overlay }),
    },
  ),
)
