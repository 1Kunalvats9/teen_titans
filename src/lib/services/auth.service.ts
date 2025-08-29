import { api, API_ENDPOINTS, ApiResponse } from '../api'

// Types
export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface SignupResponse {
  success: boolean
  message: string
}

export interface CompleteOnboardingRequest {
  persona?: string
  imageUrl?: string
}

export interface CompleteOnboardingResponse {
  success: boolean
  message: string
}

export interface ProfileImageResponse {
  success: boolean
  imageUrl: string
  message: string
}

// Auth Service
export const authService = {
  // Sign up new user
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await api.post<ApiResponse<SignupResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    )
    return response.data.data
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    )
    return response.data
  },

  // Complete onboarding
  async completeOnboarding(data: CompleteOnboardingRequest): Promise<CompleteOnboardingResponse> {
    const response = await api.post<ApiResponse<CompleteOnboardingResponse>>(
      API_ENDPOINTS.AUTH.COMPLETE_ONBOARDING,
      data
    )
    return response.data.data
  },

  // Upload profile image
  async uploadProfileImage(file: File): Promise<ProfileImageResponse> {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    const response = await api.post<ApiResponse<ProfileImageResponse>>(
      API_ENDPOINTS.AUTH.PROFILE_IMAGE,
      { file: base64 }
    )
    return response.data.data
  },
}
