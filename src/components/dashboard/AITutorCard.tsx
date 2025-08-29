'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, MessageSquare, Settings, Mic, Volume2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/hooks/auth'

interface AITutorCardProps {
  user: AuthUser
}

const getPersonaEmoji = (persona: string | null) => {
  switch (persona) {
    case 'Einstein': return '🧠'
    case 'Steve Jobs': return '💡'
    case 'Casual Friend': return '😊'
    default: return '🤖'
  }
}

const getPersonaDescription = (persona: string | null) => {
  switch (persona) {
    case 'Einstein': return 'Analytical and methodical approach'
    case 'Steve Jobs': return 'Visionary and inspiring guidance'
    case 'Casual Friend': return 'Warm and conversational style'
    default: return 'Ready to help you learn'
  }
}

export function AITutorCard({ user }: AITutorCardProps) {
  return (
    <div className="space-y-6">
      {/* AI Tutor Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5" />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Your AI Tutor
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative space-y-4">
            {/* Tutor Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-2xl">
                {getPersonaEmoji(user.persona)}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {user.persona || 'AI Assistant'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getPersonaDescription(user.persona)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button className="w-full justify-start gap-3" variant="outline">
                <MessageSquare className="w-4 h-4" />
                Start Conversation
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mic className="w-4 h-4" />
                  Voice
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Volume2 className="w-4 h-4" />
                  Listen
                </Button>
              </div>
            </div>

            {/* Tutor Stats */}
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">47</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">98%</div>
                  <div className="text-xs text-muted-foreground">Helpful</div>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="w-full gap-2">
              <Settings className="w-4 h-4" />
              Customize Tutor
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              🎯 Today's Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: 'Complete React Hooks module', completed: false },
                { task: 'Review 20 flashcards', completed: true },
                { task: 'Take ML fundamentals quiz', completed: false },
                { task: 'Join study group discussion', completed: true }
              ].map((goal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    goal.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-muted-foreground'
                  }`}>
                    {goal.completed && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    goal.completed 
                      ? 'text-muted-foreground line-through' 
                      : 'text-foreground'
                  }`}>
                    {goal.task}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}