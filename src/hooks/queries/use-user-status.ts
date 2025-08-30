import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/services/api.service'

// Types
export interface UserStatus {
  isOnboarded: boolean
  persona?: string | null
  xp: number
  streak: number
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
      return await apiService.user.getStatus()
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    retryDelay: 1000,
    enabled, // Only run query when enabled
  })
}
