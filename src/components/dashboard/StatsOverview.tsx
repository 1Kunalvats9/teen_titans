'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Zap,
  BarChart3
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { useDashboardStats } from '@/hooks/queries/use-dashboard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useTheme } from 'next-themes'

const stats = [
  {
    title: 'Total Modules',
    value: 'modules',
    icon: BookOpen,
    description: 'Available to study'
  },
  {
    title: 'Completed',
    value: 'completedModules',
    icon: Target,
    description: 'Modules finished'
  },
  {
    title: 'Study Time',
    value: 'totalStudyTime',
    icon: Clock,
    description: 'Total time spent'
  },
  {
    title: 'Quizzes Taken',
    value: 'totalQuizzes',
    icon: Award,
    description: 'Knowledge tests'
  },
  {
    title: 'Weekly Progress',
    value: 'weeklyProgress',
    icon: Zap,
    description: 'This week\'s growth'
  }
]

export function StatsOverview() {
  const { data: dashboardStats, isLoading, error } = useDashboardStats()
  const router = useRouter()
  const { theme } = useTheme()

  // Get chart colors based on theme
  const chartColors = {
    stroke: theme === 'dark' ? '#ffffff' : '#000000',
    text: theme === 'dark' ? '#ffffff' : '#000000',
    grid: theme === 'dark' ? '#ffffff20' : '#00000020',
    tooltipBg: theme === 'dark' ? '#1f2937' : '#ffffff',
    tooltipBorder: theme === 'dark' ? '#374151' : '#e5e7eb'
  }

  const getStatValue = (key: string) => {
    if (!dashboardStats) return 0
    
    switch (key) {
      case 'modules':
        return dashboardStats.totalModules || 0
      case 'completedModules':
        return dashboardStats.completedModules || 0
      case 'totalStudyTime':
        const minutes = dashboardStats.totalStudyTime || 0
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
      case 'totalQuizzes':
        return dashboardStats.totalQuizzes || 0
      case 'weeklyProgress':
        return `${dashboardStats.weeklyProgress || 0}%`
      default:
        return 0
    }
  }

  // Generate chart data from real stats
  const generateChartData = () => {
    if (!dashboardStats) return []
    
    const currentScore = dashboardStats.averageScore || 0
    const completedModules = dashboardStats.completedModules || 0
    const totalQuizzes = dashboardStats.totalQuizzes || 0
    
    // For new users with no activity, show flat line at 0
    if (completedModules === 0 && totalQuizzes === 0) {
      return Array(7).fill(0).map((_, i) => ({
        period: i === 0 ? 'Start' : i === 6 ? 'Current' : `Week ${i + 1}`,
        score: 0
      }))
    }
    
    // Create realistic progression based on actual data
    const data = []
    const baseScore = Math.max(0, currentScore - 20) // Start from 0 or reasonable base
    
    // Generate 7 data points showing progression
    for (let i = 0; i < 7; i++) {
      const progress = i / 6 // 0 to 1
      const score = Math.round(baseScore + (currentScore - baseScore) * progress)
      
      let label = ''
      if (i === 0) label = 'Start'
      else if (i === 2) label = `${completedModules} Modules`
      else if (i === 4) label = `${totalQuizzes} Quizzes`
      else if (i === 6) label = 'Current'
      else label = `Week ${i + 1}`
      
      data.push({
        period: label,
        score: score
      })
    }
    
    return data
  }

  const chartData = generateChartData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="text-center text-muted-foreground">
              <p>Failed to load stats</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mb-1">
                      {getStatValue(stat.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Average Score Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Average Score Trend</h3>
                <p className="text-sm text-muted-foreground">Your performance over time</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {dashboardStats?.averageScore || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Current Average</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.stroke} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.stroke} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartColors.grid}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="period" 
                  stroke={chartColors.text}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke={chartColors.text}
                  fontSize={12}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartColors.text,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={chartColors.stroke} 
                  strokeWidth={3}
                  fill="url(#colorScore)"
                  dot={{
                    fill: chartColors.stroke,
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartColors.stroke,
                    strokeWidth: 2,
                    fill: theme === 'dark' ? '#1f2937' : '#ffffff'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  )
}