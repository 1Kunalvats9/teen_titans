import axios, { AxiosError, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string } | undefined
    return responseData?.message || error.message || 'An error occurred'
  }
  return error instanceof Error ? error.message : 'An unknown error occurred'
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/api/auth/signup',
    VERIFY_EMAIL: '/api/auth/verify-email',
    COMPLETE_ONBOARDING: '/api/user/complete-onboarding',
    PROFILE_IMAGE: '/api/user/profile-image',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    MODULES: '/api/dashboard/modules',
    RECENT_ACTIVITY: '/api/dashboard/recent-activity',
    AI_CONVERSATIONS: '/api/dashboard/ai-conversations',
    TODAYS_GOALS: '/api/dashboard/todays-goals',
  },
  
  // User
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    STATUS: '/api/user/status',
  },
} as const
