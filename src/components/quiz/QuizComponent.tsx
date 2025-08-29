'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trophy,
  Target,
  Clock,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  text: string
  explanation: string | null
  options: QuizOption[]
}

interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

interface QuizComponentProps {
  quiz: Quiz
  onClose: () => void
}

interface QuizAttempt {
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeTaken: number
}

export function QuizComponent({ quiz, onClose }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const totalQuestions = quiz.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Timer effect
  useEffect(() => {
    if (!quizCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [startTime, quizCompleted])

  // Submit quiz attempt mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (attempt: QuizAttempt) => {
      const response = await api.post('/api/quiz/attempt', attempt)
      return response.data
    },
    onSuccess: () => {
      toast.success('Quiz results saved!')
    },
    onError: () => {
      toast.error('Failed to save quiz results')
    }
  })

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = () => {
    const correctAnswers = quiz.questions.filter(question => {
      const selectedOptionId = selectedAnswers[question.id]
      const selectedOption = question.options.find(option => option.id === selectedOptionId)
      return selectedOption?.isCorrect
    }).length

    const score = (correctAnswers / totalQuestions) * 100

    // Submit quiz attempt
    submitQuizMutation.mutate({
      quizId: quiz.id,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken: timeElapsed
    })

    setQuizCompleted(true)
    setShowResults(true)
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(false)
    setStartTime(Date.now())
    setTimeElapsed(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (showResults) {
    const correctAnswers = quiz.questions.filter(question => {
      const selectedOptionId = selectedAnswers[question.id]
      const selectedOption = question.options.find(option => option.id === selectedOptionId)
      return selectedOption?.isCorrect
    }).length

    const score = (correctAnswers / totalQuestions) * 100
    const isPassing = score >= 70

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <Card className="w-full max-w-2xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-md my-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {isPassing ? (
                <Trophy className="h-8 w-8 text-yellow-500" />
              ) : (
                <Target className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isPassing ? 'Congratulations!' : 'Quiz Complete'}
            </CardTitle>
            <CardDescription>
              {isPassing 
                ? 'You passed the quiz! Great job!' 
                : 'Keep practicing to improve your score!'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(score)}%
              </div>
              <div className="text-muted-foreground">
                {correctAnswers} out of {totalQuestions} questions correct
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((correctAnswers / totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Question Review</h3>
              {quiz.questions.map((question, index) => {
                const selectedOptionId = selectedAnswers[question.id]
                const selectedOption = question.options.find(option => option.id === selectedOptionId)
                const isCorrect = selectedOption?.isCorrect

                return (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-2 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          Question {index + 1}: {question.text}
                        </div>
                        {selectedOption && (
                          <div className={`text-sm mt-1 ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Your answer: {selectedOption.text}
                          </div>
                        )}
                        {!isCorrect && (
                          <div className="text-sm text-green-600 mt-1">
                            Correct answer: {question.options.find(opt => opt.isCorrect)?.text}
                          </div>
                        )}
                        {question.explanation && (
                          <div className="text-sm text-muted-foreground mt-2">
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRetakeQuiz}
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
    >
      <Card className="w-full max-w-4xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-md my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {currentQuestion.text}
            </h3>
            
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.id
                
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        isSelected 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border'
                      }`}>
                        {isSelected && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <span className="font-medium">{option.text}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {Object.keys(selectedAnswers).length} of {totalQuestions} answered
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < totalQuestions}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!selectedAnswers[currentQuestion.id]}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
