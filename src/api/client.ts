import axios from 'axios'
import { supabase } from '../lib/supabase'

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

// Token comes from the Supabase session (auto-refreshed by the SDK) — single source of truth.
client.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestId = error.response?.data?.metadata?.requestId
    const message = error.response?.data?.message ?? 'Erro inesperado'
    return Promise.reject({ message, requestId })
  },
)

export default client
