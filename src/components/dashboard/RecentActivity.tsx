'use client'

import { motion } from 'framer-motion'
import { Activity, Clock, MessageSquare, BookOpen, Target, Zap, ArrowRight } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { useRecentActivity } from '@/hooks/queries/use-dashboard'

export function RecentActivity() {
  const { data: recentActivity, isLoading, error } = useRecentActivity()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'module_completed':
        return <BookOpen className="w-4 h-4" />
      case 'quiz_taken':
        return <Target className="w-4 h-4" />
      case 'flashcard_reviewed':
        return <Zap className="w-4 h-4" />
      case 'ai_conversation':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return new Date(date).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest learning activities</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest learning activities</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your latest learning activities</p>
          </div>
        </div>
        {recentActivity && recentActivity.length > 5 && (
          <button className="text-sm text-foreground hover:text-foreground/80 transition-colors cursor-pointer flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {recentActivity && recentActivity.length > 0 ? (
          recentActivity.slice(0, 5).map((activity: any, index: number) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-foreground/30 transition-colors">
                {/* Activity Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <h4 className="font-medium text-foreground line-clamp-1">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {activity.description}
                  </p>
                  
                  {/* Activity Type Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-foreground text-background border border-foreground/20">
                      {activity.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No recent activity
            </h3>
            <p className="text-muted-foreground">
              Start learning to see your activity here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}