'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, memo } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { LearningProgress } from '@/components/dashboard/LearningProgress'
import { TodaysGoals } from '@/components/dashboard/TodaysGoals'
import { AiConversations } from '@/components/dashboard/AiConversations'
import { AiTutorSession } from '@/components/dashboard/AiTutorSession'
import { CommunityInviteNotification } from '@/components/community/CommunityInviteNotification'
import { useAllDashboardData } from '@/hooks/queries/use-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FloatingChatbotButton } from '@/components/chatbot/FloatingChatbotButton'

const DashboardContent = memo(function DashboardContent() {
  const { user, isLoading } = useAuth()
  const { error } = useAllDashboardData()
  const router = useRouter()

  // Debug log to see what user data we're getting
  console.log('Dashboard rendering with user:', user)

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) return null

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Error loading dashboard</div>
          <div className="text-muted-foreground">{error.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:text-primary/80 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <DashboardHeader user={user} />
        
        {/* Community Invite Notifications */}
        <CommunityInviteNotification />
        
        {/* Welcome Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {user.name || 'Learner'}! 👋
              </h1>
              <p className="text-muted-foreground mt-2">
                Ready to continue your learning journey? Here's what you can do today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => router.push('/modules')}
                className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                Start Learning
              </button>
              <button 
                onClick={() => router.push('/ai-tutor-session')}
                className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                Talk to AI Tutor
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <StatsOverview />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Learning Progress */}
            <LearningProgress />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <TodaysGoals />
            <AiConversations />
          </div>
        </div>
      </div>
      
      {/* Floating Chatbot Button */}
      <FloatingChatbotButton />
    </div>
  )
})

export default function Dashboard() {
  return <DashboardContent />
}