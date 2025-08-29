'use client'

import { Calendar, Trophy, TrendingUp, BookOpen } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import type { AuthUser } from '@/hooks/auth'
import { useDashboardStats } from '@/hooks/queries/use-dashboard'

interface DashboardHeaderProps {
  user: AuthUser
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { data: stats, error } = useDashboardStats()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Memoize the greeting and date to prevent unnecessary re-renders
  const greeting = getGreeting()
  const currentDate = formatDate()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PremiumCard variant="gradient" className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || 'Profile'}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  {greeting}, {user.name?.split(' ')[0] || 'Learner'}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4" />
                  {currentDate}
                </p>
              </div>
            </div>
            
            {user.persona && (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  🧠 {user.persona} Mode
                </div>
                <div className="text-sm text-muted-foreground">
                  Your AI tutor is ready to help
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-2 mx-auto">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.studyStreak || 0}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl mb-2 mx-auto">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.completedModules || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-xl mb-2 mx-auto">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.averageScore || 0}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}