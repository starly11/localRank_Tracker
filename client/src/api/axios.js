import axios from 'axios'

const normalizeApiBaseUrl = (value) => {
  const raw = String(value || '').trim().replace(/\/+$/, '')
  if (!raw) return 'http://localhost:3000/api'
  if (/\/api$/i.test(raw)) return raw
  return `${raw}/api`
}

const baseURL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 60000)

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: timeoutMs
})

// Attach JWT from localStorage on every request (works cross-domain, unlike cookies)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
