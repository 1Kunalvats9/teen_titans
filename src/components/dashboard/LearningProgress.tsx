'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, Play, CheckCircle, Trophy, ArrowRight, Plus } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { useLearningModules, useCompleteModule, useUpdateModuleProgress } from '@/hooks/queries/use-dashboard'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LearningProgress() {
  const { data: modules, isLoading, error } = useLearningModules()
  const completeModule = useCompleteModule()
  const updateProgress = useUpdateModuleProgress()
  const router = useRouter()

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-foreground bg-foreground/10 border-foreground/20'
      case 'intermediate':
        return 'text-foreground bg-foreground/10 border-foreground/20'
      case 'advanced':
        return 'text-foreground bg-foreground/10 border-foreground/20'
      default:
        return 'text-foreground bg-foreground/10 border-foreground/20'
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleContinueModule = (module: any) => {
    router.push(`/modules/${module.id}`)
  }

  const handleCompleteModule = async (moduleId: string) => {
    try {
      await completeModule.mutateAsync(moduleId)
    } catch (error) {
      console.error('Failed to complete module:', error)
    }
  }

  const handleQuickProgress = async (moduleId: string, currentProgress: number) => {
    const newProgress = Math.min(currentProgress + 0.25, 1.0) // Increment by 25%
    try {
      await updateProgress.mutateAsync({ 
        moduleId, 
        progress: newProgress,
        completed: newProgress >= 1.0 
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  // Debug: Log modules data
  console.log('LearningProgress - Modules data:', modules)

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Learning Progress</h3>
            <p className="text-sm text-muted-foreground">Continue where you left off</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Learning Progress</h3>
            <p className="text-sm text-muted-foreground">Continue where you left off</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load modules</p>
          <Button 
            variant="outline" 
            className="mt-4 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const recentModules = modules?.slice(0, 3) || []

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Learning Progress</h3>
            <p className="text-sm text-muted-foreground">
              {modules && modules.length > 0 
                ? `Continue where you left off (${modules.length} modules available)`
                : 'Start your learning journey'
              }
            </p>
          </div>
        </div>
        {modules && modules.length > 3 && (
          <Button 
            variant="outline" 
            size="sm"
            className="cursor-pointer"
            onClick={() => router.push('/modules')}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {recentModules.length > 0 ? (
          recentModules.map((module: any, index: number) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="p-4 rounded-xl border border-border hover:border-foreground/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {module.title}
                      </h4>
                      {module.isCompleted && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-foreground text-background border border-foreground/20">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {module.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {module.lastAccessed && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last: {new Date(module.lastAccessed).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Progress: {Math.round(module.progress * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3">
                    {/* Progress Bar */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-medium text-foreground">
                        {Math.round(module.progress * 100)}%
                      </div>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground transition-all duration-300"
                          style={{ width: `${module.progress * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {module.isCompleted ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => handleContinueModule(module)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="default"
                            className="cursor-pointer bg-foreground text-background hover:bg-foreground/90"
                            onClick={() => handleContinueModule(module)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </Button>
                          {module.progress < 1.0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="cursor-pointer text-xs"
                              onClick={() => handleQuickProgress(module.id, module.progress)}
                              disabled={updateProgress.isPending}
                            >
                              +25%
                            </Button>
                          )}
                          {module.progress >= 0.75 && !module.isCompleted && (
                            <Button 
                              size="sm" 
                              variant="default"
                              className="cursor-pointer bg-foreground text-background hover:bg-foreground/90"
                              onClick={() => handleCompleteModule(module.id)}
                              disabled={completeModule.isPending}
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="cursor-pointer bg-foreground text-background hover:bg-foreground/90"
                onClick={() => router.push('/modules')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Modules
              </Button>
              <Button 
                variant="outline"
                className="cursor-pointer"
                onClick={() => router.push('/modules?create=true')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Module
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}