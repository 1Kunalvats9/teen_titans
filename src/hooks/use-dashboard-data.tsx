'use client'

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react'
import { useAuth } from './auth'

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



export interface TodaysGoal {
  id: string
  task: string
  completed: boolean
}

type DashboardDataContextType = {
  stats: DashboardStats | null
  modules: LearningModule[]
  recentActivity: RecentActivity[]

  goals: TodaysGoal[]
  isLoading: boolean
  error: string | null
  refreshData: () => void
}

const DashboardDataContext = createContext<DashboardDataContextType | null>(null)

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [modules, setModules] = useState<LearningModule[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  const [goals, setGoals] = useState<TodaysGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Add a ref to track if we're already fetching to prevent duplicate calls
  const isFetchingRef = React.useRef(false)
  const userIdRef = React.useRef<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id || isFetchingRef.current) return
    
    try {
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)

      const [statsRes, modulesRes, activityRes, conversationsRes, goalsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/modules'),
        fetch('/api/dashboard/recent-activity'),
        fetch('/api/dashboard/ai-conversations'),
        fetch('/api/dashboard/todays-goals')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (modulesRes.ok) setModules(await modulesRes.json())
      if (activityRes.ok) setRecentActivity(await activityRes.json())
  
      if (goalsRes.ok) setGoals(await goalsRes.json())
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [user?.id])

  // Only fetch data once when user changes and hasn't been initialized
  useEffect(() => {
    if (user?.id && !isFetchingRef.current) {
      // Only fetch if the user ID has actually changed
      if (userIdRef.current !== user.id) {
        userIdRef.current = user.id
        setHasInitialized(false)
        setStats(null)
        setModules([])
        setRecentActivity([])
  
        setGoals([])
        setError(null)
      }
      
      if (!hasInitialized) {
        setHasInitialized(true)
        fetchDashboardData()
      }
    }
  }, [user?.id, hasInitialized, fetchDashboardData])

  const refreshData = useCallback(() => {
    if (user?.id && !isFetchingRef.current) {
      fetchDashboardData()
    }
  }, [user?.id, fetchDashboardData])

  const value = useMemo<DashboardDataContextType>(() => ({
    stats,
    modules,
    recentActivity,
    
    goals,
    isLoading,
    error,
    refreshData
  }), [stats, modules, recentActivity, goals, isLoading, error, refreshData])

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext)
  if (!ctx) throw new Error('useDashboardData must be used within DashboardDataProvider')
  return ctx
}


