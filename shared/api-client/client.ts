/**
 * Connect — Shared typed Axios API client.
 *
 * Generated from the backend OpenAPI schema (see api-client/schema.d.ts).
 *
 * This client is role-agnostic. Each frontend app (connect_user, connect_guide,
 * connect_admin) wraps it with its own token storage:
 *   - Mobile (Expo): expo-secure-store
 *   - Admin (web): zustand + localStorage
 *
 * The response interceptor handles 401 by attempting a token refresh via
 * POST /auth/refresh; on refresh failure it clears auth state (app-specific).
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

export type ApiClientConfig = {
  baseURL?: string
  getAccessToken: () => string | null | Promise<string | null>
  getRefreshToken: () => string | null | Promise<string | null>
  setTokens: (access: string, refresh: string) => void | Promise<void>
  clearAuth: () => void | Promise<void>
  onUnauthenticated?: () => void | Promise<void>
}

/**
 * Create a typed Axios instance wired to the Connect API.
 * Token management callbacks are supplied by the consuming app.
 */
export function createApiClient({
  baseURL = 'http://localhost:8000/api/v1',
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuth,
  onUnauthenticated,
}: ApiClientConfig): AxiosInstance {
  const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  // Request interceptor: attach bearer token
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor: refresh on 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = await getRefreshToken()
          if (!refreshToken) {
            await clearAuth()
            await onUnauthenticated?.()
            return Promise.reject(error)
          }

          const { data } = await axios.post(
            `${baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )

          await setTokens(data.access_token, data.refresh_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          await clearAuth()
          await onUnauthenticated?.()
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return api
}

export default createApiClient
