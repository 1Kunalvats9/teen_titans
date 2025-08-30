import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/services/api.service'
import { toast } from 'sonner'

// Query keys for modules
export const moduleKeys = {
  all: ['modules'] as const,
  lists: () => [...moduleKeys.all, 'list'] as const,
  list: (filters: string) => [...moduleKeys.lists(), { filters }] as const,
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...moduleKeys.details(), id] as const,
}

// Types
export interface Module {
  id: string
  title: string
  description: string | null
  createdAt: string
  creator: {
    id: string
    name: string | null
    email: string
  } | null
  _count: {
    steps: number
    quizzes: number
  }
  steps?: Array<{
    id: string
    title: string
    content: string
    order: number
  }>
  quizzes?: Array<{
    id: string
    title: string
    questions: Array<{
      id: string
      text: string
      explanation: string | null
      options: Array<{
        id: string
        text: string
        isCorrect: boolean
      }>
    }>
  }>
}

export interface CreateModuleData {
  topic: string
  description?: string
}

// Fetch all modules
export const useModules = () => {
  return useQuery({
    queryKey: moduleKeys.lists(),
    queryFn: async (): Promise<Module[]> => {
      return await apiService.modules.getAll()
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Fetch single module
export const useModule = (moduleId: string) => {
  return useQuery({
    queryKey: moduleKeys.detail(moduleId),
    queryFn: async () => {
      return await apiService.modules.getById(moduleId)
    },
    enabled: !!moduleId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Create module mutation
export const useCreateModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateModuleData) => {
      return await apiService.modules.create(data)
    },
    onMutate: async (newModule) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: moduleKeys.lists() })

      // Snapshot the previous value
      const previousModules = queryClient.getQueryData<Module[]>(moduleKeys.lists())

      // Optimistically update to the new value
      if (previousModules) {
        const optimisticModule: Module = {
          id: `temp-${Date.now()}`,
          title: newModule.topic,
          description: newModule.description || null,
          createdAt: new Date().toISOString(),
          creator: null, // Will be filled by the server
          _count: {
            steps: 0,
            quizzes: 0
          }
        }

        queryClient.setQueryData<Module[]>(moduleKeys.lists(), (old) => {
          return old ? [optimisticModule, ...old] : [optimisticModule]
        })
      }

      // Return a context object with the snapshotted value
      return { previousModules }
    },
    onError: (err: any, newModule, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousModules) {
        queryClient.setQueryData(moduleKeys.lists(), context.previousModules)
      }
      
      console.error('Module creation error:', err)
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          'Failed to create module'
      toast.error(errorMessage)
    },
    onSuccess: (data) => {
      // Invalidate and refetch modules list
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
      
      // Also invalidate dashboard data if it exists
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      toast.success('Module created successfully!')
      console.log('Module created successfully:', data)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
    },
  })
}

// Delete module mutation
export const useDeleteModule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (moduleId: string) => {
      await apiService.modules.delete(moduleId)
    },
    onMutate: async (moduleId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: moduleKeys.lists() })

      // Snapshot the previous value
      const previousModules = queryClient.getQueryData<Module[]>(moduleKeys.lists())

      // Optimistically remove the module
      if (previousModules) {
        queryClient.setQueryData<Module[]>(moduleKeys.lists(), (old) => {
          return old ? old.filter(module => module.id !== moduleId) : []
        })
      }

      // Return a context object with the snapshotted value
      return { previousModules }
    },
    onError: (err: any, moduleId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousModules) {
        queryClient.setQueryData(moduleKeys.lists(), context.previousModules)
      }
      
      console.error('Module deletion error:', err)
      toast.error('Failed to delete module')
    },
    onSuccess: (data, moduleId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: moduleKeys.detail(moduleId) })
      
      // Invalidate and refetch modules list
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
      
      // Also invalidate dashboard data if it exists
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      toast.success('Module deleted')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
    },
  })
}

// Debug modules (for troubleshooting)
export const useDebugModules = () => {
  return useQuery({
    queryKey: [...moduleKeys.all, 'debug'],
    queryFn: async () => {
      return await apiService.modules.debug()
    },
    enabled: false, // Only run when explicitly called
    retry: false,
  })
}

// Invalidate all module queries
export const useInvalidateModules = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: moduleKeys.all })
  }
}
