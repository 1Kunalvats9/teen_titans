import { api, API_ENDPOINTS, handleApiError } from '../api'
import { toast } from 'sonner'

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

export interface DashboardStats {
  totalModules: number
  completedModules: number
  totalXP: number
  currentStreak: number
  weeklyProgress: number
  studyStreak: number
  averageScore: number
  totalStudyTime: number
  totalQuizzes: number
}

export interface DashboardModule {
  id: string
  title: string
  description: string | null
  progress: number
  isCompleted: boolean
  lastAccessed: string | null
}

export interface RecentActivity {
  id: string
  type: 'module_started' | 'module_completed' | 'quiz_taken' | 'xp_earned'
  title: string
  description: string
  timestamp: string
  xpEarned?: number
}



export interface TodaysGoal {
  id: string
  task: string
  completed: boolean
  createdAt: string
  date: string
}

export interface UserStatus {
  isOnboarded: boolean
  persona?: string
  xp: number
  streak: number
}

// Auth API Functions
export const authAPI = {
  signup: async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, data)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return { success: false, error: errorMessage }
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return { success: false, error: errorMessage }
    }
  },

  completeOnboarding: async (data: { persona?: string; imageUrl?: string }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.COMPLETE_ONBOARDING, data)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return { success: false, error: errorMessage }
    }
  },

  uploadProfileImage: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post(API_ENDPOINTS.AUTH.PROFILE_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return { success: false, error: errorMessage }
    }
  },
}

// Dashboard API Functions
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS)
    return response.data.data
  },

  getModules: async (): Promise<DashboardModule[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.MODULES)
    return response.data.data
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY)
    return response.data.data
  },

  getTodaysGoals: async (): Promise<TodaysGoal[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.TODAYS_GOALS)
    return response.data.data
  },

  createGoal: async (task: string): Promise<TodaysGoal> => {
    const response = await api.post(API_ENDPOINTS.DASHBOARD.TODAYS_GOALS, { task })
    return response.data.data
  },

  updateGoal: async (id: string, data: { completed?: boolean; task?: string }): Promise<TodaysGoal> => {
    const response = await api.put(API_ENDPOINTS.DASHBOARD.TODAYS_GOALS, { id, ...data })
    return response.data.data
  },

  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.DASHBOARD.TODAYS_GOALS}?id=${id}`)
  },

  updateModuleProgress: async (moduleId: string, progress: number, completed?: boolean): Promise<any> => {
    const response = await api.put(`/api/modules/${moduleId}/progress`, { progress, completed })
    return response.data.data
  },

  completeModule: async (moduleId: string): Promise<any> => {
    const response = await api.post(`/api/modules/${moduleId}/complete`)
    return response.data.data
  },

  getAllData: async () => {
    const [stats, modules, activity, goals] = await Promise.all([
      dashboardAPI.getStats(),
      dashboardAPI.getModules(),
      dashboardAPI.getRecentActivity(),
      dashboardAPI.getTodaysGoals(),
    ])

    return {
      stats,
      modules,
      activity,
      goals,
    }
  },
}

  // Modules API Functions
  export const modulesAPI = {
    getAll: async (): Promise<Module[]> => {
      const response = await api.get(API_ENDPOINTS.MODULES.ALL)
      return response.data
    },

    getById: async (id: string): Promise<Module> => {
      const response = await api.get(API_ENDPOINTS.MODULES.DETAIL(id))
      return response.data
    },

    create: async (data: CreateModuleData): Promise<Module> => {
      const response = await api.post(API_ENDPOINTS.MODULES.CREATE, data)
      return response.data
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(API_ENDPOINTS.MODULES.DELETE(id))
    },

    restore: async (id: string): Promise<void> => {
      await api.post(`/api/modules/${id}/restore`)
    },

    getDeleted: async (): Promise<Module[]> => {
      const response = await api.get('/api/modules/deleted')
      return response.data
    },

    debug: async () => {
      const response = await api.get(API_ENDPOINTS.MODULES.DEBUG)
      return response.data
    },
  }

// User API Functions
export const userAPI = {
  getStatus: async (): Promise<UserStatus> => {
    const response = await api.get(API_ENDPOINTS.USER.STATUS)
    return response.data.data
  },

  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.USER.PROFILE)
    return response.data.data
  },

  updateProfile: async (data: any) => {
    const response = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data)
    return response.data.data
  },
}

// Quiz API Functions
export const quizAPI = {
  submitAttempt: async (data: { moduleId: string; answers: any[] }) => {
    const response = await api.post('/api/quiz/attempt', data)
    return response.data
  },
}

// Export all API functions
export const apiService = {
  auth: authAPI,
  dashboard: dashboardAPI,
  modules: modulesAPI,
  user: userAPI,
  quiz: quizAPI,
}
