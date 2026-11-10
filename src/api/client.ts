import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, invalidateAccessToken } from '../lib/auth'

export interface ApiResponse<T> {
  data: T
  metadata: {
    requestId: string
    timestamp: string
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:54732',
  headers: { 'Content-Type': 'application/json' },
})

// The API accepts Neon Auth JWTs (15 min); lib/auth caches one and refreshes it before expiry.
client.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean }

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined
    // A 401 can mean the cached JWT just expired or was revoked: fetch a fresh one and retry once.
    if (error.response?.status === 401 && config && !config._authRetried) {
      config._authRetried = true
      invalidateAccessToken()
      return client(config)
    }
    const requestId = error.response?.data?.metadata?.requestId
    const message = error.response?.data?.message ?? 'Erro inesperado'
    return Promise.reject({ message, requestId })
  },
)

export default client
