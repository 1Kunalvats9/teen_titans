'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Zap
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { useDashboardStats } from '@/hooks/queries/use-dashboard'

const stats = [
  {
    title: 'Total Modules',
    value: 'modules',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    title: 'Completed',
    value: 'completedModules',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  {
    title: 'Study Time',
    value: 'totalStudyTime',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    title: 'Avg Score',
    value: 'averageScore',
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  {
    title: 'Quizzes Taken',
    value: 'totalQuizzes',
    icon: Award,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  {
    title: 'Weekly Progress',
    value: 'weeklyProgress',
    icon: Zap,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  }
]

export function StatsOverview() {
  const { data: dashboardStats, isLoading, error } = useDashboardStats()
  const router = useRouter()

  const getStatValue = (key: string) => {
    if (!dashboardStats) return 0
    
    switch (key) {
      case 'modules':
        return dashboardStats.totalModules || 0
      case 'completedModules':
        return dashboardStats.completedModules || 0
      case 'totalStudyTime':
        return `${Math.round((dashboardStats.totalStudyTime || 0) / 60)}h` // Convert to hours
      case 'averageScore':
        return `${dashboardStats.averageScore || 0}%`
      case 'totalQuizzes':
        return dashboardStats.totalQuizzes || 0
      case 'weeklyProgress':
        return `${dashboardStats.weeklyProgress || 0}`
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <PremiumCard key={i} className="h-32">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </PremiumCard>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <PremiumCard key={i} className="h-32">
            <div className="text-center text-muted-foreground">
              <p>Failed to load stats</p>
            </div>
          </PremiumCard>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div
              onClick={() => {
                if (stat.title === 'Total Modules') {
                  router.push('/modules')
                }
              }}
              className="cursor-pointer"
            >
              <PremiumCard 
                variant="default" 
                className="h-32 flex flex-col justify-center hover:shadow-lg transition-all duration-300"
              >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {getStatValue(stat.value)}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              </PremiumCard>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}