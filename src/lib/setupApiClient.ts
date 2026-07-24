import { configureApiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/stores/authStore'

configureApiClient({
  getTokens: () => {
    const { accessToken, refreshToken } = useAuthStore.getState()
    return { accessToken, refreshToken }
  },
  setTokens: (tokens) => useAuthStore.getState().applyTokens(tokens),
  onAuthFailure: () => useAuthStore.getState().logout(),
})
