import { apiRequest } from '@/lib/apiClient'
import type { AuthUser, LoginResponse } from '@/types'

export interface LoginPayload {
  username: string
  password: string
}

export const login = (payload: LoginPayload) => {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { ...payload, expiresInMins: 30 },
  })
}

export const fetchCurrentUser = (signal?: AbortSignal) => {
  return apiRequest<AuthUser>('/auth/me', { auth: true, signal })
}
