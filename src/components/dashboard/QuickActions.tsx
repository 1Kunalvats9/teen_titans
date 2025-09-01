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
  Sparkles,
  Search,
  ArrowRight,
  Mic
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { ModuleSearch } from './ModuleSearch'
import { toast } from 'sonner'

const quickActions = [
  {
    title: 'Start Learning',
    description: 'Continue your modules',
    icon: BookOpen,
    action: 'learn',
    category: 'primary'
  },
  {
    title: 'AI Tutor Voice',
    description: 'Learn through voice conversations',
    icon: Mic,
    action: 'ai-tutor',
    category: 'primary'
  },
  {
    title: 'AI Chatbot',
    description: 'Ask questions & solve problems',
    icon: Brain,
    action: 'chatbot',
    category: 'primary'
  },
  {
    title: 'Take Quiz',
    description: 'Test your knowledge',
    icon: Target,
    action: 'quiz',
    category: 'secondary'
  },
  {
    title: 'Study Group',
    description: 'Join discussions',
    icon: Users,
    action: 'group',
    category: 'secondary'
  },
  {
    title: 'Flashcards',
    description: 'Review with SRS',
    icon: Zap,
    action: 'flashcards',
    category: 'secondary'
  },
  {
    title: 'New Module',
    description: 'Explore topics',
    icon: Plus,
    action: 'new',
    category: 'secondary'
  }
]

export function QuickActions() {
  const router = useRouter()

  const handleAction = (action: string) => {
    // Handle different actions
    switch (action) {
      case 'learn':
        // Navigate to learning modules
        router.push('/modules')
        break
      case 'ai-tutor':
        // Navigate to AI Tutor voice interface
        router.push('/ai-tutor')
        break
      case 'chatbot':
        // Open AI chatbot
        router.push('/chatbot')
        break
      case 'quiz':
        // Navigate to quizzes - show available quizzes from modules
        router.push('/modules?view=quizzes')
        toast.info('Quiz feature coming soon! For now, check your modules for available quizzes.')
        break
      case 'group':
        // Navigate to study groups
        toast.info('Study Groups feature coming soon! Join our community discussions.')
        break
      case 'flashcards':
        // Navigate to flashcards
        router.push('/modules?view=flashcards')
        toast.info('Flashcards feature coming soon! Review your learning materials.')
        break
      case 'new':
        // Navigate to modules page with create form
        router.push('/modules?create=true')
        break
      case 'tutor-demo':
        // Open AI tutor demo
        router.push('/ai-tutor-demo')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const primaryActions = quickActions.filter(action => action.category === 'primary')
  const secondaryActions = quickActions.filter(action => action.category === 'secondary')

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Start</h3>
            <p className="text-sm text-muted-foreground">Jump into your learning journey</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleAction(action.action)}
                  className="w-full p-4 rounded-xl border border-border hover:border-foreground/30 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background group-hover:bg-foreground/90 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-foreground/80 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">More Tools</h3>
            <p className="text-sm text-muted-foreground">Additional learning resources</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {secondaryActions.map((action, index) => {
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
                  className="w-full p-3 rounded-lg border border-border hover:border-foreground/30 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background group-hover:bg-foreground/90 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground text-xs group-hover:text-foreground/80 transition-colors">
                        {action.title}
                      </h4>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
      
      {/* Search and Create Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Find & Create</h3>
            <p className="text-sm text-muted-foreground">Search modules or create new ones</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Search Modules</h4>
            <ModuleSearch />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2 cursor-pointer"
              onClick={() => router.push('/modules?create=true')}
            >
              <Plus className="w-4 h-4" />
              Create Module
            </Button>
            <Button 
              variant="outline" 
              onClick={()=>{router.push('/modules')}} 
              className="flex-1 gap-2 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              Browse All
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}