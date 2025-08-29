import { api, API_ENDPOINTS, ApiResponse } from '../api'

// Types
export interface DashboardStats {
  totalModules: number
  completedModules: number
  totalQuizzes: number
  averageScore: number
  studyStreak: number
  totalStudyTime: number
  weeklyProgress: number
}

export interface LearningModule {
  id: string
  title: string
  description: string
  progress: number
  isCompleted: boolean
  lastAccessed: Date
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
}

export interface RecentActivity {
  id: string
  type: 'module_completed' | 'quiz_taken' | 'flashcard_reviewed' | 'ai_conversation'
  title: string
  description: string
  timestamp: Date
  icon: string
}

export interface AIConversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

export interface TodaysGoal {
  id: string
  task: string
  completed: boolean
}

// Dashboard Service
export const dashboardService = {
  // Get dashboard stats
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.DASHBOARD.STATS
    )
    return response.data.data
  },

  // Get learning modules
  async getModules(): Promise<LearningModule[]> {
    const response = await api.get<ApiResponse<LearningModule[]>>(
      API_ENDPOINTS.DASHBOARD.MODULES
    )
    return response.data.data
  },

  // Get recent activity
  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await api.get<ApiResponse<RecentActivity[]>>(
      API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY
    )
    return response.data.data
  },

  // Get AI conversations
  async getAIConversations(): Promise<AIConversation[]> {
    const response = await api.get<ApiResponse<AIConversation[]>>(
      API_ENDPOINTS.DASHBOARD.AI_CONVERSATIONS
    )
    return response.data.data
  },

  // Get today's goals
  async getTodaysGoals(): Promise<TodaysGoal[]> {
    const response = await api.get<ApiResponse<TodaysGoal[]>>(
      API_ENDPOINTS.DASHBOARD.TODAYS_GOALS
    )
    return response.data.data
  },

  // Get all dashboard data at once
  async getAllDashboardData() {
    const [stats, modules, activity, conversations, goals] = await Promise.all([
      this.getStats(),
      this.getModules(),
      this.getRecentActivity(),
      this.getAIConversations(),
      this.getTodaysGoals(),
    ])

    return {
      stats,
      modules,
      activity,
      conversations,
      goals,
    }
  },
}
