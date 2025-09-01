'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkles, Mic, Brain, BookOpen, Users, Zap } from 'lucide-react'
import { AiTutorDemo } from '@/components/ai-tutor/AiTutorDemo'
import TopicSelector from '@/components/ai-tutor/TopicSelector'

export default function AiTutorDemoPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'overview' | 'demo' | 'topics'>('overview')

  const features = [
    {
      icon: Mic,
      title: "Voice Conversations",
      description: "Natural voice interactions with Alisha using ElevenLabs voice synthesis",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Adaptive explanations and examples based on your learning level",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: BookOpen,
      title: "Topic Selection",
      description: "Choose from various learning topics including programming, web development, and more",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Users,
      title: "Conversation History",
      description: "Track and resume your learning sessions with conversation history",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Zap,
      title: "Real-time Interaction",
      description: "Instant responses and real-time learning feedback",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    }
  ]

  const handleTopicSelect = (topicId: string, subtopic: string, difficulty: string) => {
    // In demo mode, just show the demo interface
    setCurrentView('demo')
  }

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
                onClick={() => router.push('/dashboard')}
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
                  AI Tutor Demo
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-muted/20 rounded-lg p-1">
              <Button
                variant={currentView === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('overview')}
              >
                Overview
              </Button>
              <Button
                variant={currentView === 'topics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('topics')}
              >
                Topic Selection
              </Button>
              <Button
                variant={currentView === 'demo' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('demo')}
              >
                Live Demo
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {currentView === 'overview' && (
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Meet Alisha, Your AI Learning Assistant
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Experience the future of learning with voice-based AI tutoring. Alisha provides personalized, 
                      interactive learning sessions with natural conversations and real-time feedback.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => setCurrentView('demo')}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Try Demo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentView('topics')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explore Topics
                    </Button>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <Card key={index} className="bg-gradient-to-br from-card to-card/80 border-border/50">
                        <CardHeader>
                          <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                            <Icon className={`w-6 h-6 ${feature.color}`} />
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Setup Info */}
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Setup Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Environment Variables</h4>
                        <div className="space-y-2 text-sm">
                          <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_VAPI_WEB_TOKEN</code>
                          <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_VAPI_WORKFLOW_ID</code>
                          <code className="bg-muted px-2 py-1 rounded">GOOGLE_AI_API_KEY</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Voice Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                          Uses ElevenLabs voice "Alisha - Soft and Engaging" for natural, 
                          friendly conversations with Indian female accent.
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> This demo shows the interface without requiring VAPI setup. 
                        The full version includes real voice conversations and AI-powered learning sessions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentView === 'topics' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Learning Topics</h2>
                  <p className="text-muted-foreground">Select a topic to explore with Alisha</p>
                </div>
                <TopicSelector onTopicSelect={handleTopicSelect} />
              </div>
            )}

            {currentView === 'demo' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Live Demo</h2>
                  <p className="text-muted-foreground">Experience the AI Tutor interface</p>
                </div>
                <AiTutorDemo />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
