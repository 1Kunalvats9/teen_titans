'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Trophy } from 'lucide-react'
import type { AuthUser } from '@/hooks/auth'

interface DashboardHeaderProps {
  user: AuthUser
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-3xl" />
      
      <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || 'Profile'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {getGreeting()}, {user.name?.split(' ')[0] || 'Learner'}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate()}
                </p>
              </div>
            </div>
            
            {user.persona && (
              <div className="flex items-center gap-2 mt-3">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  🧠 {user.persona} Mode
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-2">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{user.xp || 0}</div>
              <div className="text-xs text-muted-foreground">XP Points</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl mb-2">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground">{user.streak || 0}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}