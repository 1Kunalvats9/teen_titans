'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Target, Users, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AuthUser } from '@/hooks/auth'

interface StatsOverviewProps {
  user: AuthUser
}

const statsData = [
  {
    title: 'Modules Completed',
    value: '12',
    change: '+3 this week',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'AI Sessions',
    value: '47',
    change: '+8 today',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    title: 'Quiz Accuracy',
    value: '89%',
    change: '+5% improvement',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    title: 'Study Groups',
    value: '3',
    change: 'Active',
    icon: Users,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    title: 'Learning Streak',
    value: '15',
    change: 'days',
    icon: TrendingUp,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    title: 'Badges Earned',
    value: '8',
    change: '2 new',
    icon: Award,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  }
]

export function StatsOverview({ user }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs font-medium text-muted-foreground">{stat.title}</div>
                <div className="text-xs text-primary">{stat.change}</div>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}