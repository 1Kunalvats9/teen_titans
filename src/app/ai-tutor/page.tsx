'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import TopicSelector from '@/components/ai-tutor/TopicSelector'
import { AiTutorCall } from '@/components/ai-tutor/AiTutorCall'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function AiTutorPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [sessionState, setSessionState] = useState<'selecting' | 'loading' | 'conversation'>('selecting')
  const [conversationId, setConversationId] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const handleTopicSelect = async (topicId: string, subtopic: string, difficulty: string) => {
    if (!user) return

    setSessionState('loading')
    
    try {
      const response = await fetch('/api/ai-tutor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          subtopic,
          difficulty
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConversationId(data.conversationId)
        setSelectedTopic(subtopic)
        setSessionData(data)
        setSessionState('conversation')
      } else {
        console.error('Failed to generate session')
        setSessionState('selecting')
      }
    } catch (error) {
      console.error('Error generating session:', error)
      setSessionState('selecting')
    }
  }

  const handleBackToSelection = () => {
    setSessionState('selecting')
    setConversationId('')
    setSelectedTopic('')
    setSessionData(null)
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {sessionState === 'conversation' && (
                <Button
                  variant="ghost"
                  onClick={handleBackToSelection}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Topics</span>
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-primary">
                  AI Learning Assistant
                </h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {sessionState === 'selecting' && (
              <TopicSelector onTopicSelect={handleTopicSelect} />
            )}

            {sessionState === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Preparing Your Learning Session</h2>
                  <p className="text-muted-foreground">Alisha is getting ready to teach you...</p>
                </div>
                <LoadingSpinner size="lg" />
              </div>
            )}

            {sessionState === 'conversation' && conversationId && (
              <AiTutorCall
                conversationId={conversationId}
                topic={selectedTopic}
                onEndCall={handleBackToSelection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
