'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowLeft,
  CheckCircle,
  Circle,
  Target,
  ChevronRight,
  ChevronLeft,
  Play,
  Bookmark,
  Share2,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useModule } from '@/hooks/queries/use-modules'
import { useParams } from 'next/navigation'
import { QuizComponent } from '@/components/quiz/QuizComponent'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EnhancedContent } from '@/components/ui/enhanced-content'

interface Step {
  id: string
  title: string
  content: string
  order: number
}

interface Quiz {
  id: string
  title: string
  questions: {
    id: string
    text: string
    explanation: string | null
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
  }[]
}

interface Module {
  id: string
  title: string
  description: string | null
  createdAt: string
  creator: {
    name: string | null
  } | null
  steps: Step[]
  quizzes: Quiz[]
}

export default function ModulePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string
  
  const [currentStep, setCurrentStep] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Fetch module data using centralized hook
  const { data: module, isLoading: moduleLoading, error } = useModule(moduleId)

  // Remove client-side redirect since middleware handles it
  // This prevents conflicts between server-side and client-side redirects

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setIsNavigating(true)
      setCurrentStep(currentStep - 1)
      // Simulate loading time for better UX
      setTimeout(() => setIsNavigating(false), 300)
    }
  }

  const handleNextStep = () => {
    if (module && module.steps && currentStep < module.steps.length - 1) {
      setIsNavigating(true)
      setCurrentStep(currentStep + 1)
      // Simulate loading time for better UX
      setTimeout(() => setIsNavigating(false), 300)
    }
  }

  const handleStartQuiz = () => {
    if (module?.quizzes && module.quizzes.length > 0) {
      setShowQuiz(true)
    }
  }

  if (isLoading || moduleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading module..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Error loading module</div>
          <div className="text-muted-foreground">The module could not be found or loaded.</div>
          <Button onClick={() => router.push('/modules')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (middleware will handle redirect)
  if (!user || !module) return null

  // Don't render if module doesn't have steps
  if (!module.steps || module.steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Module has no content</div>
          <div className="text-muted-foreground">This module doesn't have any steps yet.</div>
          <Button onClick={() => router.push('/modules')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </div>
      </div>
    )
  }

  const currentStepData = module.steps[currentStep]
  const progress = ((currentStep + 1) / module.steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.02),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.02),transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/modules')}
                  className="hover:bg-background/50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Modules
                </Button>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-foreground">
                    {module.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className="hover:bg-background/50"
                    >
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-background/50"
                    >
                      <Share2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                {module.description && (
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {module.description}
                  </p>
                )}
              </div>

              {/* Module Info */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Created {formatDate(module.createdAt)}</span>
                </div>
                {module.creator?.name && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>by {module.creator.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{module.steps.length} steps</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{module.quizzes?.length || 0} quiz</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Steps Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Learning Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {module.steps.map((step: Step, index: number) => (
                      <motion.button
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setCurrentStep(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                          index === currentStep
                            ? 'bg-primary/10 border border-primary/20 text-primary'
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {index < currentStep ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {step.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Step {index + 1} of {module.steps?.length || 0}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Quiz Button */}
                  {module.quizzes && module.quizzes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <Button
                        onClick={handleStartQuiz}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Take Quiz
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {isNavigating ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="md" text="Loading step..." />
                </div>
              ) : (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {currentStepData.title}
                        </CardTitle>
                        <CardDescription>
                          Step {currentStep + 1} of {module.steps.length}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousStep}
                          disabled={currentStep === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextStep}
                          disabled={currentStep === module.steps.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EnhancedContent 
                      content={currentStepData.content}
                      stepNumber={currentStep + 1}
                      totalSteps={module.steps.length}
                    />
                  </CardContent>
                </Card>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Step
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {currentStep + 1} of {module.steps.length}
                  </span>
                </div>

                {currentStep === module.steps.length - 1 ? (
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Take Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            onClick={() => {
              const element = document.querySelector('.lg\\:col-span-3')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </motion.div>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && module?.quizzes && module.quizzes.length > 0 && (
          <QuizComponent 
            quiz={module.quizzes[0]} 
            onClose={() => setShowQuiz(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
