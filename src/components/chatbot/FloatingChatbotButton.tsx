'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function FloatingChatbotButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Hide on module pages since they have their own chatbot
  const isModulePage = pathname.startsWith('/modules/') && pathname !== '/modules'
  if (isModulePage) {
    return null
  }

  const handleChatbotClick = () => {
    router.push('/chatbot')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className="w-64 border-border/50 bg-background/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-foreground" />
                    </div>
                    <span className="font-semibold text-sm">AI Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-6 w-6 p-0 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get instant help with questions, problem solving, and image analysis
                </p>
                <Button
                  onClick={handleChatbotClick}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 text-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-foreground/90 hover:shadow-xl cursor-pointer"
      >
        <Bot className="w-6 h-6" />
      </motion.button>
    </div>
  )
}
