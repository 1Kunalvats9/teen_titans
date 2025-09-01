'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'

interface AiConversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  messageCount: number
}

export function AiConversations() {
  const router = useRouter()

  const { data: conversations, isLoading } = useQuery<AiConversation[]>({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/ai-conversations')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      return data.data || []
    }
  })

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Conversations</h3>
            <p className="text-sm text-muted-foreground">Recent learning sessions</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/ai-tutor')}
          className="cursor-pointer"
        >
          Start New
        </Button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.slice(0, 3).map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div
                  onClick={() => router.push(`/ai-tutor?conversation=${conversation.id}`)}
                  className="group p-3 rounded-lg border border-border hover:border-foreground/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {conversation.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs w-fit">
                          {conversation.messageCount} messages
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {truncateText(conversation.lastMessage)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(conversation.timestamp)}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="font-medium text-foreground mb-1">No conversations yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Start your first learning session with AI Tutor
            </p>
            <Button
              onClick={() => router.push('/ai-tutor')}
              className="bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
