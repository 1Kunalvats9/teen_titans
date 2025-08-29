'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Brain, MessageSquare, BookOpen, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
  {
    title: 'Create Module',
    description: 'Start a new learning module',
    icon: Plus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    hoverColor: 'hover:bg-blue-500/20'
  },
  {
    title: 'Search Modules',
    description: 'Find existing content',
    icon: Search,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    hoverColor: 'hover:bg-green-500/20'
  },
  {
    title: 'AI Tutor',
    description: 'Ask your AI mentor',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    hoverColor: 'hover:bg-purple-500/20'
  },
  {
    title: 'Study Groups',
    description: 'Join collaborative rooms',
    icon: MessageSquare,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    hoverColor: 'hover:bg-orange-500/20'
  },
  {
    title: 'Practice Quiz',
    description: 'Test your knowledge',
    icon: BookOpen,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    hoverColor: 'hover:bg-cyan-500/20'
  },
  {
    title: 'Flashcards',
    description: 'Review with SRS',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    hoverColor: 'hover:bg-yellow-500/20'
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                className={`h-auto p-4 flex flex-col items-center gap-3 w-full ${action.hoverColor} transition-all duration-300 group`}
              >
                <div className={`p-3 rounded-xl ${action.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}