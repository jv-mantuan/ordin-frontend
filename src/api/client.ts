import axios, { type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import { getAccessToken } from '../lib/auth'

/** Exact message of the backend's 403 for an unsafe account link (must match the API). */
export const ACCOUNT_LINKING_MESSAGE = 'Por segurança, redefina sua senha em "Esqueci minha senha" para continuar.'

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
  } else {
    // A retried request must not carry the stale token from its first attempt.
    delete config.headers.Authorization
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
      // Go to the network: the SDK would otherwise hand back the same cached JWT.
      await getAccessToken({ forceRefresh: true })
      return client(config)
    }
    const requestId = error.response?.data?.metadata?.requestId
    const message = error.response?.data?.message ?? 'Erro inesperado'
    // The API blocks accounts where a never-verified password was merged with a Google sign-in
    // until the password is reset by email code (see the backend's account-linking check).
    if (error.response?.status === 403 && message === ACCOUNT_LINKING_MESSAGE) {
      toast.error(message, { toastId: 'account-linking' })
      if (window.location.pathname !== '/esqueci-senha') window.location.assign('/esqueci-senha')
    }
    return Promise.reject({ message, requestId })
  },
)

export default client
