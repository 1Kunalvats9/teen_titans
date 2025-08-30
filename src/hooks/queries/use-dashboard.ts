import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/services/api.service'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  modules: () => [...dashboardKeys.all, 'modules'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  conversations: () => [...dashboardKeys.all, 'conversations'] as const,
  goals: () => [...dashboardKeys.all, 'goals'] as const,
  allData: () => [...dashboardKeys.all, 'allData'] as const,
}

// Dashboard Stats Query
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      return await apiService.dashboard.getStats()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Learning Modules Query
export const useLearningModules = () => {
  return useQuery({
    queryKey: dashboardKeys.modules(),
    queryFn: async () => {
      return await apiService.dashboard.getModules()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Recent Activity Query
export const useRecentActivity = () => {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: async () => {
      return await apiService.dashboard.getRecentActivity()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// AI Conversations Query
export const useAIConversations = () => {
  return useQuery({
    queryKey: dashboardKeys.conversations(),
    queryFn: async () => {
      return await apiService.dashboard.getAIConversations()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Today's Goals Query
export const useTodaysGoals = () => {
  return useQuery({
    queryKey: dashboardKeys.goals(),
    queryFn: async () => {
      return await apiService.dashboard.getTodaysGoals()
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// All Dashboard Data Query
export const useAllDashboardData = () => {
  return useQuery({
    queryKey: dashboardKeys.allData(),
    queryFn: async () => {
      return await apiService.dashboard.getAllData()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Refresh Dashboard Data Mutation
export const useRefreshDashboardData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await apiService.dashboard.getAllData()
    },
    onSuccess: (data) => {
      // Update all individual queries with the new data
      queryClient.setQueryData(dashboardKeys.stats(), data.stats)
      queryClient.setQueryData(dashboardKeys.modules(), data.modules)
      queryClient.setQueryData(dashboardKeys.activity(), data.activity)
      queryClient.setQueryData(dashboardKeys.conversations(), data.conversations)
      queryClient.setQueryData(dashboardKeys.goals(), data.goals)
      queryClient.setQueryData(dashboardKeys.allData(), data)
    },
    onError: (error) => {
      console.error('Failed to refresh dashboard data:', error)
    },
  })
}

// Invalidate Dashboard Data
export const useInvalidateDashboardData = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}
