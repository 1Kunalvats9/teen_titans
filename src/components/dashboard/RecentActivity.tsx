'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, MessageSquare, BookOpen, Brain, Trophy, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const activities = [
  {
    id: '1',
    type: 'quiz_completed',
    title: 'Completed React Hooks Quiz',
    description: 'Scored 92% on Advanced React Patterns',
    time: '2 hours ago',
    icon: BookOpen,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: '2',
    type: 'ai_session',
    title: 'AI Tutoring Session',
    description: 'Discussed useCallback optimization with Einstein',
    time: '4 hours ago',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: '3',
    type: 'badge_earned',
    title: 'Badge Unlocked!',
    description: 'Earned "React Master" badge',
    time: '1 day ago',
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    id: '4',
    type: 'flashcard_session',
    title: 'Flashcard Review',
    description: 'Reviewed 25 cards in JavaScript Fundamentals',
    time: '1 day ago',
    icon: Zap,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: '5',
    type: 'chat_message',
    title: 'Study Group Discussion',
    description: 'Participated in "Web Dev Bootcamp" chat',
    time: '2 days ago',
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  }
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300 group cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${activity.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  {activity.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}