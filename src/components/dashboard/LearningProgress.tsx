'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const currentModules = [
  {
    id: '1',
    title: 'Advanced React Patterns',
    progress: 75,
    totalSteps: 12,
    completedSteps: 9,
    timeSpent: '4h 30m',
    lastAccessed: '2 hours ago',
    difficulty: 'Advanced',
    category: 'Frontend Development'
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    progress: 45,
    totalSteps: 20,
    completedSteps: 9,
    timeSpent: '8h 15m',
    lastAccessed: '1 day ago',
    difficulty: 'Intermediate',
    category: 'Data Science'
  },
  {
    id: '3',
    title: 'System Design Principles',
    progress: 20,
    totalSteps: 15,
    completedSteps: 3,
    timeSpent: '2h 45m',
    lastAccessed: '3 days ago',
    difficulty: 'Advanced',
    category: 'Backend Development'
  }
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'text-green-500 bg-green-500/10'
    case 'Intermediate': return 'text-yellow-500 bg-yellow-500/10'
    case 'Advanced': return 'text-red-500 bg-red-500/10'
    default: return 'text-gray-500 bg-gray-500/10'
  }
}

export function LearningProgress() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Learning Progress
          </CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:bg-muted/30">
                {/* Progress Circle */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted stroke-current"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary stroke-current transition-all duration-500"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${module.progress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{module.progress}%</span>
                  </div>
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {module.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {module.category}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {module.completedSteps}/{module.totalSteps} steps
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {module.timeSpent}
                    </div>
                    <div>
                      Last: {module.lastAccessed}
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <Button 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}