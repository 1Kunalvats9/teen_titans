'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, memo } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { LearningProgress } from '@/components/dashboard/LearningProgress'
import { AITutorCard } from '@/components/dashboard/AITutorCard'
import { useAllDashboardData } from '@/hooks/queries/use-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const DashboardContent = memo(function DashboardContent() {
  const { user, isLoading } = useAuth()
  const { error } = useAllDashboardData()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) return null

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Error loading dashboard</div>
          <div className="text-muted-foreground">{error.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:text-primary/80"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/95 to-background/90" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
        
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.02),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.02),transparent_50%)]" />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="relative pt-20 pb-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <DashboardHeader user={user} />
          
          {/* Stats Overview */}
          <StatsOverview />
          
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
})

export default function Dashboard() {
  return <DashboardContent />
}