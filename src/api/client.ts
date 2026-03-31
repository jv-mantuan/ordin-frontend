import axios from 'axios'

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

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
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
