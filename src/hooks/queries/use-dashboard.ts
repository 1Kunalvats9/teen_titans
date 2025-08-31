import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/services/api.service'
import { toast } from 'sonner'

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  modules: () => [...dashboardKeys.all, 'modules'] as const,
  recentActivity: () => [...dashboardKeys.all, 'recent-activity'] as const,

  todaysGoals: () => [...dashboardKeys.all, 'todays-goals'] as const,
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
    queryKey: dashboardKeys.recentActivity(),
    queryFn: async () => {
      return await apiService.dashboard.getRecentActivity()
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
    queryKey: dashboardKeys.todaysGoals(),
    queryFn: async () => {
      return await apiService.dashboard.getTodaysGoals()
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Create Goal Mutation
export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: string) => {
      return await apiService.dashboard.createGoal(task)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.todaysGoals() })
      toast.success('Goal added successfully')
    },
    onError: (error: any) => {
      console.error('Create goal error:', error)
      toast.error('Failed to add goal')
    },
  })
}

// Update Goal Mutation
export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { completed?: boolean; task?: string } }) => {
      return await apiService.dashboard.updateGoal(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.todaysGoals() })
    },
    onError: (error: any) => {
      console.error('Update goal error:', error)
      toast.error('Failed to update goal')
    },
  })
}

// Delete Goal Mutation
export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiService.dashboard.deleteGoal(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.todaysGoals() })
      toast.success('Goal deleted successfully')
    },
    onError: (error: any) => {
      console.error('Delete goal error:', error)
      toast.error('Failed to delete goal')
    },
  })
}

// Update Module Progress Mutation
export const useUpdateModuleProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ moduleId, progress, completed }: { moduleId: string; progress: number; completed?: boolean }) => {
      return await apiService.dashboard.updateModuleProgress(moduleId, progress, completed)
    },
    onSuccess: () => {
      // Invalidate both modules and stats to refresh the data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.modules() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.recentActivity() })
      toast.success('Progress updated successfully')
    },
    onError: (error: any) => {
      console.error('Update module progress error:', error)
      toast.error('Failed to update progress')
    },
  })
}

// Complete Module Mutation
export const useCompleteModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (moduleId: string) => {
      return await apiService.dashboard.completeModule(moduleId)
    },
    onSuccess: () => {
      // Invalidate all dashboard data to refresh everything
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success('Module completed! Great job! 🎉')
    },
    onError: (error: any) => {
      console.error('Complete module error:', error)
      toast.error('Failed to complete module')
    },
  })
}

// All Dashboard Data Query
export const useAllDashboardData = () => {
  return useQuery({
    queryKey: dashboardKeys.all,
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
      queryClient.setQueryData(dashboardKeys.recentActivity(), data.activity)

      queryClient.setQueryData(dashboardKeys.todaysGoals(), data.goals)
      queryClient.setQueryData(dashboardKeys.all, data)
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
