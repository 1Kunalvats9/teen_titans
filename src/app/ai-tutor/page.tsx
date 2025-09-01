'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { VapiVoiceWidget } from '@/components/ai-tutor/VapiVoiceWidget'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Mic, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AiTutorPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [chatMode, setChatMode] = useState<'voice' | 'text'>('voice')

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleSwitchToTextChat = () => {
    setChatMode('text')
  }

  const handleSwitchToVoiceChat = () => {
    setChatMode('voice')
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
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
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
            {/* Chat Mode Selector */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {chatMode === 'voice' ? <Mic className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                  {chatMode === 'voice' ? 'Voice Chat' : 'Text Chat'}
                </Badge>
              </div>
              
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {chatMode === 'voice' ? 'Voice Learning Session' : 'Text Learning Session'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {chatMode === 'voice' 
                  ? 'Start a voice conversation with your AI tutor to learn naturally'
                  : 'Chat with your AI tutor through text for detailed explanations'
                }
              </p>
              
              {/* Chat Type Switcher */}
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant={chatMode === 'voice' ? "default" : "outline"}
                  size="sm"
                  onClick={handleSwitchToVoiceChat}
                  className="bg-primary"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Chat
                </Button>
                <Button
                  variant={chatMode === 'text' ? "default" : "outline"}
                  size="sm"
                  onClick={handleSwitchToTextChat}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Text Chat
                </Button>
              </div>
            </div>

            {/* Voice Chat Interface */}
            {chatMode === 'voice' && (
              <VapiVoiceWidget
                onEndCall={handleBackToDashboard}
              />
            )}

            {/* Text Chat Interface */}
            {chatMode === 'text' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Text Chat Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Text-based chat interface will be available in the next update.
                    For now, enjoy the voice chat experience!
                  </p>
                </div>
                <Button
                  onClick={handleSwitchToVoiceChat}
                  variant="outline"
                  size="lg"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Switch to Voice Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
