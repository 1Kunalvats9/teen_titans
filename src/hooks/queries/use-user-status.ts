import { useQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS, ApiResponse } from '@/lib/api'

// Types
export interface UserStatus {
  id: string
  isOnboarded: boolean
  persona?: string | null
  image?: string | null
  name?: string | null
  email?: string | null
}

// Query keys
export const userStatusKeys = {
  all: ['userStatus'] as const,
  status: () => [...userStatusKeys.all, 'status'] as const,
}

// User Status Query
export const useUserStatus = (enabled: boolean = true) => {
  return useQuery({
    queryKey: userStatusKeys.status(),
    queryFn: async (): Promise<UserStatus> => {
      const response = await api.get<ApiResponse<UserStatus>>(API_ENDPOINTS.USER.STATUS)
      return response.data.data
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    retryDelay: 1000,
    enabled, // Only run query when enabled
  })
}
