import type { RefreshResponse } from '@/types'

export const API_BASE_URL = 'https://dummyjson.com'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface TokenPair {
  accessToken: string | null
  refreshToken: string | null
}

interface ApiClientHandlers {
  getTokens: () => TokenPair
  setTokens: (tokens: RefreshResponse) => void
  onAuthFailure: () => void
}

let handlers: ApiClientHandlers = {
  getTokens: () => ({ accessToken: null, refreshToken: null }),
  setTokens: () => {},
  onAuthFailure: () => {},
}

export const configureApiClient = (next: Partial<ApiClientHandlers>) => {
  handlers = { ...handlers, ...next }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
  searchParams?: Record<string, string | number | undefined>
}

const buildUrl = (path: string, searchParams?: RequestOptions['searchParams']) => {
  const url = new URL(path, API_BASE_URL)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

const parseResponse = async (response: Response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const isTokenRejection = (status: number, message: string) => {
  const normalized = message.toLowerCase()
  if (status === 401) return true
  return status === 500 && normalized.includes('token')
}

let refreshPromise: Promise<RefreshResponse> | null = null

const refreshTokens = async (): Promise<RefreshResponse> => {
  const { refreshToken } = handlers.getTokens()
  if (!refreshToken) {
    throw new ApiError(401, 'Sesi berakhir, silakan login kembali.')
  }

  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(payload, 'Gagal memperbarui sesi.'))
  }

  return payload as RefreshResponse
}

const refreshTokensOnce = (): Promise<RefreshResponse> => {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

const executeRequest = async <T>(path: string, options: RequestOptions, accessToken: string | null): Promise<T> => {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.searchParams), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(payload, `Permintaan gagal (${response.status}).`))
  }

  return payload as T
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { accessToken } = handlers.getTokens()

  try {
    return await executeRequest<T>(path, options, options.auth ? accessToken : null)
  } catch (error) {
    const shouldRetry =
      options.auth && error instanceof ApiError && isTokenRejection(error.status, error.message)

    if (!shouldRetry) throw error

    try {
      const tokens = await refreshTokensOnce()
      handlers.setTokens(tokens)
      return await executeRequest<T>(path, options, tokens.accessToken)
    } catch (refreshError) {
      if (refreshError instanceof DOMException && refreshError.name === 'AbortError') throw refreshError
      handlers.onAuthFailure()
      throw new ApiError(401, 'Sesi Anda telah berakhir. Silakan login kembali.')
    }
  }
}
