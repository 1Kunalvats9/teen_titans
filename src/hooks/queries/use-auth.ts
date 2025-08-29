import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/lib/services/auth.service'
import { handleApiError } from '@/lib/api'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  onboarding: () => [...authKeys.all, 'onboarding'] as const,
}

// Signup Mutation
export const useSignup = () => {
  return useMutation({
    mutationFn: authService.signup,
    onError: (error) => {
      console.error('Signup failed:', handleApiError(error))
    },
  })
}

// Verify Email Mutation
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authService.verifyEmail,
    onError: (error) => {
      console.error('Email verification failed:', handleApiError(error))
    },
  })
}

// Complete Onboarding Mutation
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.completeOnboarding,
    onSuccess: () => {
      // Invalidate user data to refresh session
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: (error) => {
      console.error('Onboarding completion failed:', handleApiError(error))
    },
  })
}

// Upload Profile Image Mutation
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.uploadProfileImage,
    onSuccess: () => {
      // Invalidate user data to refresh session
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: (error) => {
      console.error('Profile image upload failed:', handleApiError(error))
    },
  })
}
