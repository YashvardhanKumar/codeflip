import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import axios from 'axios'
import { BASE_URL } from './constants'

import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string into the user's local timezone.
 * If the timezone cannot be detected, it defaults to the system time.
 */
export function formatInUserTimezone(
  dateString: string,
  formatStr: string
): string {
  try {
    const date = new Date(dateString)
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const zonedDate = toZonedTime(date, userTimezone)
    return format(zonedDate, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function buildApiUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url
  return new URL(url.replace(/^\/+/, ''), `${BASE_URL}/`).toString()
}

const apiClient = axios.create({
  baseURL: `${BASE_URL}/`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
})

// Add a request interceptor to attach the token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function apiFetcher<T = any>(url: string): Promise<T> {
  return apiClient.get<T>(url).then((response) => response.data)
}

export function apiFetch(url: string, init: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Token ${token}`)
  }

  return fetch(buildApiUrl(url), {
    ...init,
    headers,
  })
}

export default apiClient
