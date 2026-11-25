/**
 * Connect Guide — typed Axios API client.
 * Wraps the shared createApiClient with expo-secure-store token storage.
 */
import { createApiClient } from '@connect/shared/api-client'
import * as SecureStore from 'expo-secure-store'

const JWT_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

const getAccessToken = async () => SecureStore.getItemAsync(JWT_KEY)
const getRefreshToken = async () => SecureStore.getItemAsync(REFRESH_KEY)
const setTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(JWT_KEY, access)
  await SecureStore.setItemAsync(REFRESH_KEY, refresh)
}
const clearAuth = async () => {
  await SecureStore.deleteItemAsync(JWT_KEY)
  await SecureStore.deleteItemAsync(REFRESH_KEY)
}

export const api = createApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuth,
  onUnauthenticated: () => {
    // Navigate to login is handled by app-level auth guard
  },
})

export const clearGuideAuth = clearAuth
