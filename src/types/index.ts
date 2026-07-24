export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

export interface LoginResponse extends AuthUser {
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface ProductDimensions {
  width: number
  height: number
  depth: number
}

export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface ProductMeta {
  createdAt: string
  updatedAt: string
  barcode: string
  qrCode: string
}

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand?: string
  sku: string
  weight: number
  dimensions: ProductDimensions
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: ProductReview[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: ProductMeta
  images: string[]
  thumbnail: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface ProductFormValues {
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  stock: number
  brand: string
}

export const SORTABLE_FIELDS = ['title', 'price', 'rating', 'stock'] as const

export type SortField = (typeof SORTABLE_FIELDS)[number]

export type SortOrder = 'asc' | 'desc'

export interface ProductQuery {
  q: string
  category: string
  sortBy: SortField | ''
  order: SortOrder
  page: number
  limit: number
}
