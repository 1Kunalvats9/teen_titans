import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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
      console.log('Calling dashboard stats API directly...')
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      return data.data
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
      const response = await fetch('/api/dashboard/modules')
      if (!response.ok) {
        throw new Error('Failed to fetch modules')
      }
      const data = await response.json()
      return data.data
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
      const response = await fetch('/api/dashboard/recent-activity')
      if (!response.ok) {
        throw new Error('Failed to fetch recent activity')
      }
      const data = await response.json()
      return data.data
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
      const response = await fetch('/api/dashboard/ai-conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch AI conversations')
      }
      const data = await response.json()
      return data.data
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
      const response = await fetch('/api/dashboard/todays-goals')
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s goals')
      }
      const data = await response.json()
      return data.data
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
      const [statsRes, modulesRes, activityRes, conversationsRes, goalsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/modules'),
        fetch('/api/dashboard/recent-activity'),
        fetch('/api/dashboard/ai-conversations'),
        fetch('/api/dashboard/todays-goals')
      ])

      const [stats, modules, activity, conversations, goals] = await Promise.all([
        statsRes.json(),
        modulesRes.json(),
        activityRes.json(),
        conversationsRes.json(),
        goalsRes.json()
      ])

      return {
        stats: stats.data,
        modules: modules.data,
        activity: activity.data,
        conversations: conversations.data,
        goals: goals.data,
      }
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
      const [statsRes, modulesRes, activityRes, conversationsRes, goalsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/modules'),
        fetch('/api/dashboard/recent-activity'),
        fetch('/api/dashboard/ai-conversations'),
        fetch('/api/dashboard/todays-goals')
      ])

      const [stats, modules, activity, conversations, goals] = await Promise.all([
        statsRes.json(),
        modulesRes.json(),
        activityRes.json(),
        conversationsRes.json(),
        goalsRes.json()
      ])

      return {
        stats: stats.data,
        modules: modules.data,
        activity: activity.data,
        conversations: conversations.data,
        goals: goals.data,
      }
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
