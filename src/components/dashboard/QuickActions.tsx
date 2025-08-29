'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Brain, 
  Target, 
  Users, 
  Zap, 
  Play,
  Plus,
  Sparkles
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { ModuleSearch } from './ModuleSearch'


const quickActions = [
  {
    title: 'Start Learning',
    description: 'Continue your modules',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    action: 'learn'
  },
  {
    title: 'AI Tutor Chat',
    description: 'Get help from your tutor',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    action: 'chat'
  },
  {
    title: 'Take Quiz',
    description: 'Test your knowledge',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    action: 'quiz'
  },
  {
    title: 'Study Group',
    description: 'Join discussions',
    icon: Users,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    action: 'group'
  },
  {
    title: 'Flashcards',
    description: 'Review with SRS',
    icon: Zap,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    action: 'flashcards'
  },
  {
    title: 'New Module',
    description: 'Explore topics',
    icon: Plus,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    action: 'new'
  }
]

export function QuickActions() {
  const router = useRouter()

  const handleAction = (action: string) => {
    // Handle different actions
    switch (action) {
      case 'learn':
        // Navigate to learning modules
        console.log('Navigate to learning')
        break
      case 'chat':
        // Open AI chat
        console.log('Open AI chat')
        break
      case 'quiz':
        // Navigate to quizzes
        console.log('Navigate to quizzes')
        break
      case 'group':
        // Navigate to study groups
        console.log('Navigate to study groups')
        break
      case 'flashcards':
        // Navigate to flashcards
        console.log('Navigate to flashcards')
        break
      case 'new':
        // Navigate to modules page with create form
        router.push('/modules?create=true')
        break
    }
  }

  return (
    <PremiumCard 
      icon={<Play className="w-5 h-5" />}
      title="Quick Actions"
      subtitle="Jump into your learning"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                onClick={() => handleAction(action.action)}
                className="group w-full p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${action.bgColor} ${action.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>
      
      {/* Search and Create Section */}
      <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Search Modules</h4>
          <ModuleSearch />
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 gap-2 cursor-pointer"
            onClick={() => router.push('/modules?create=true')}
          >
            <Sparkles className="w-4 h-4" />
            Create Module
          </Button>
          <Button variant="outline" onClick={()=>{router.push('/modules')}} className="flex-1 gap-2 cursor-pointer">
            <Target className="w-4 h-4" />
            Practice
          </Button>
        </div>
      </div>


    </PremiumCard>
  )
}