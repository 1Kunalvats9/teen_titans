'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { LearningProgress } from '@/components/dashboard/LearningProgress'
import { AITutorCard } from '@/components/dashboard/AITutorCard'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace('/login')
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Main Dashboard Content */}
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <DashboardHeader user={user} />
          
          {/* Stats Overview */}
          <StatsOverview user={user} />
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <QuickActions />
              <LearningProgress />
              <RecentActivity />
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              <AITutorCard user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}