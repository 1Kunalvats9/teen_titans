'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, MessageSquare, Settings, Mic, Volume2, CheckCircle, Plus, Clock, Target, Bot, Lightbulb, Smile } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/hooks/auth'
import { useAIConversations, useTodaysGoals } from '@/hooks/queries/use-dashboard'

interface AITutorCardProps {
  user: AuthUser
}

const getPersonaIcon = (persona: string | null | undefined) => {
  switch (persona) {
    case 'Einstein': return <Brain className="w-6 h-6 text-white" />
    case 'Steve Jobs': return <Lightbulb className="w-6 h-6 text-white" />
    case 'Casual Friend': return <Smile className="w-6 h-6 text-white" />
    default: return <Bot className="w-6 h-6 text-white" />
  }
}

const getPersonaDescription = (persona: string | null | undefined) => {
  switch (persona) {
    case 'Einstein': return 'Analytical and methodical approach'
    case 'Steve Jobs': return 'Visionary and inspiring guidance'
    case 'Casual Friend': return 'Warm and conversational style'
    default: return 'Ready to help you learn'
  }
}

export function AITutorCard({ user }: AITutorCardProps) {
  const { data: aiConversations, isLoading: conversationsLoading, error: conversationsError } = useAIConversations()
  const { data: goals, error: goalsError } = useTodaysGoals()

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* AI Tutor Card */}
      <PremiumCard variant="gradient">
        {/* Tutor Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/80 to-accent/70 rounded-2xl flex items-center justify-center shadow-lg">
            {getPersonaIcon(user.persona)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {user.persona || 'AI Assistant'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getPersonaDescription(user.persona)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button className="w-full justify-start gap-3 cursor-pointer" variant="outline">
            <MessageSquare className="w-4 h-4" />
            Start Conversation
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <Mic className="w-4 h-4" />
              Voice
            </Button>
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <Volume2 className="w-4 h-4" />
              Listen
            </Button>
          </div>
        </div>

        {/* Tutor Stats */}
        <div className="pt-4 border-t border-border/50 mt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">
                {aiConversations?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">98%</div>
              <div className="text-xs text-muted-foreground">Helpful</div>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="w-full gap-2 mt-4 cursor-pointer">
          <Settings className="w-4 h-4" />
          Customize Tutor
        </Button>
      </PremiumCard>

      {/* Recent Conversations */}
      <PremiumCard 
        icon={<MessageSquare className="w-5 h-5" />}
        title="Recent Conversations"
        subtitle="Continue your AI discussions"
      >
        <div className="space-y-3">
          {conversationsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            ))
          ) : aiConversations && aiConversations.length > 0 ? (
            aiConversations.slice(0, 3).map((conversation: any, index: number) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">
                      {conversation.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(conversation.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {conversation.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {conversation.messageCount} messages
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs cursor-pointer">
                      Continue
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No conversations yet
              </p>
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="w-3 h-3" />
                Start Chat
              </Button>
            </div>
          )}
          
          {aiConversations && aiConversations.length > 3 && (
            <div className="text-center pt-2">
              <button className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer">
                View All ({aiConversations.length})
              </button>
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Today's Goals */}
      <PremiumCard 
        icon={<Target className="w-5 h-5" />}
        title="Today&apos;s Goals"
        subtitle="Stay on track with your learning"
      >
        <div className="space-y-3">
          {goalsError ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-500">Failed to load goals</p>
            </div>
          ) : goals && goals.length > 0 ? (
            goals.map((goal: any, index: number) => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  goal.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-muted-foreground'
                }`}>
                  {goal.completed && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className={`text-sm transition-colors ${
                  goal.completed 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}>
                  {goal.task}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No goals set for today</p>
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  )
}