'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, BookOpen, Brain, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateModule } from '@/hooks/queries/use-modules'
import { toast } from 'sonner'

interface CreateModuleFormProps {
  onClose: () => void
}

export function CreateModuleForm({ onClose }: CreateModuleFormProps) {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const router = useRouter()

  const createModuleMutation = useCreateModule()

  // Simulate progress updates
  const startProgressSimulation = () => {
    const progressInterval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev === '') return 'Generating prerequisites...'
        if (prev === 'Generating prerequisites...') return 'Creating module outline...'
        if (prev === 'Creating module outline...') return 'Writing detailed content...'
        if (prev === 'Writing detailed content...') return 'Creating quiz questions...'
        return 'Finalizing module...'
      })
    }, 3000)
    return progressInterval
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    if (topic.trim().length < 3) {
      toast.error('Topic must be at least 3 characters long')
      return
    }

    setIsGenerating(true)
    const progressInterval = startProgressSimulation()
    
    createModuleMutation.mutate(
      {
        topic: topic.trim(),
        description: description.trim(),
      },
      {
        onSuccess: (data) => {
          clearInterval(progressInterval)
          setIsGenerating(false)
          setGenerationStep('')
          router.push(`/modules/${data.moduleId}`)
          onClose()
        },
        onError: () => {
          clearInterval(progressInterval)
          setIsGenerating(false)
          setGenerationStep('')
        }
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className="w-full max-w-lg shadow-2xl border-border/50 bg-background/95 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Create New Module</CardTitle>
          <CardDescription>
            Let AI generate a comprehensive learning module for you
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">
                Topic *
              </Label>
              <Input
                id="topic"
                type="text"
                placeholder="e.g., React Hooks, Machine Learning Basics, Python for Beginners"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50"
                disabled={isGenerating}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what you want to learn
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any specific requirements or context..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary/50 resize-none"
                disabled={isGenerating}
              />
            </div>

            {/* Features Preview */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-muted-foreground">What you'll get:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Structured learning steps</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Detailed explanations</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Interactive quiz</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {isGenerating && (
                <p className="text-xs text-muted-foreground text-center">
                  ⏱️ This may take 30-60 seconds due to AI processing
                </p>
              )}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                              <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isGenerating || !topic.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {generationStep || 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Module
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
