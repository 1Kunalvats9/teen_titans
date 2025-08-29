'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, Play, CheckCircle } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { useLearningModules } from '@/hooks/queries/use-dashboard'

export function LearningProgress() {
  const { data: modules, isLoading, error } = useLearningModules()

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'advanced':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (isLoading) {
    return (
      <PremiumCard 
        icon={<BookOpen className="w-5 h-5" />}
        title="Learning Progress"
        subtitle="Continue where you left off"
      >
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </PremiumCard>
    )
  }

  if (error) {
    return (
      <PremiumCard 
        icon={<BookOpen className="w-5 h-5" />}
        title="Learning Progress"
        subtitle="Continue where you left off"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load modules</p>
        </div>
      </PremiumCard>
    )
  }

  const recentModules = modules?.slice(0, 3) || []

  return (
    <PremiumCard 
      icon={<BookOpen className="w-5 h-5" />}
      title="Learning Progress"
      subtitle="Continue where you left off"
    >
      <div className="space-y-4">
        {recentModules.length > 0 ? (
          recentModules.map((module: any, index: number) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground truncate">
                      {module.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty || 'intermediate'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(module.estimatedTime || 0)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {module.category || 'General'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-4">
                  {/* Progress Bar */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-medium text-foreground">
                      {Math.round(module.progress * 100)}%
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        style={{ width: `${module.progress * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    size="sm" 
                    variant={module.isCompleted ? "outline" : "default"}
                    className="cursor-pointer"
                  >
                    {module.isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No modules yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start your learning journey by exploring available modules
            </p>
            <Button className="cursor-pointer">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Modules
            </Button>
          </div>
        )}
        
        {modules && modules.length > 3 && (
          <div className="text-center pt-4">
            <Button variant="outline" className="w-full cursor-pointer">
              View All Modules ({modules.length})
            </Button>
          </div>
        )}
      </div>
    </PremiumCard>
  )
}