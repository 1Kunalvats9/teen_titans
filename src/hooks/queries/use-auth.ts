import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/services/api.service'
import { toast } from 'sonner'

// Complete onboarding mutation
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { persona?: string; imageUrl?: string }) => {
      const result = await apiService.auth.completeOnboarding(data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Onboarding completed successfully!')
    },
    onError: (error: Error) => {
      console.error('Complete onboarding error:', error)
      toast.error(error.message || 'Failed to complete onboarding')
    },
  })
}

// Upload profile image mutation
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const result = await apiService.auth.uploadProfileImage(file)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile image updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Upload profile image error:', error)
      toast.error(error.message || 'Failed to upload profile image')
    },
  })
}
