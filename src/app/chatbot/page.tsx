'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ChatbotInterface } from '@/components/chatbot/ChatbotInterface'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Footer } from '@/components/layout/Footer'
import { Sparkles } from 'lucide-react'

export default function ChatbotPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.02),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.02),transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <div className="relative z-10 pt-6 pb-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BackButton href="/dashboard">
                  Back to Dashboard
                </BackButton>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-background" />
                  </div>
                  <h1 className="text-2xl font-bold text-primary">
                    AI Chatbot Assistant
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Interface */}
        <div className="relative z-10 flex-1 container mx-auto px-4 pb-6">
          <ChatbotInterface user={user} />
        </div>
      </div>
    </div>
  )
}
