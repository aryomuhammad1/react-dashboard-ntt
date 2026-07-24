import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ApiError } from '@/lib/apiClient'
import { fetchCurrentUser, login as loginRequest } from '@/features/auth/api'
import type { AuthUser, RefreshResponse } from '@/types'

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  status: AuthStatus
  isSubmitting: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  bootstrap: () => Promise<void>
  applyTokens: (tokens: RefreshResponse) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'unknown',
      isSubmitting: false,
      error: null,

      login: async (username, password) => {
        set({ isSubmitting: true, error: null })
        try {
          const response = await loginRequest({ username, password })
          const { accessToken, refreshToken, ...user } = response
          set({
            user,
            accessToken,
            refreshToken,
            status: 'authenticated',
            isSubmitting: false,
            error: null,
          })
          return true
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : 'Terjadi kesalahan, silakan coba lagi.'
          set({ isSubmitting: false, error: message })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          status: 'unauthenticated',
          error: null,
        })
      },

      bootstrap: async () => {
        if (!get().accessToken) {
          set({ status: 'unauthenticated' })
          return
        }

        try {
          const user = await fetchCurrentUser()
          set({ user, status: 'authenticated' })
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' })
        }
      },

      applyTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ntt-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)
