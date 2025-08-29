'use client'

import React from 'react'
import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Code, 
  BookOpen, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Play,
  Zap,
  Star,
  TrendingUp,
  Users,
  Clock,
  Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

interface EnhancedContentProps {
  content: string
  stepNumber: number
  totalSteps: number
}

interface ContentBlock {
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'example' | 'tip' | 'warning' | 'summary'
  content: string
  level?: number
  items?: string[]
}

export function EnhancedContent({ content, stepNumber, totalSteps }: EnhancedContentProps) {
  const [expandedExamples, setExpandedExamples] = React.useState<Set<number>>(new Set())

  // Parse markdown content into structured blocks
  const parseContent = (content: string): ContentBlock[] => {
    const lines = content.split('\n')
    const blocks: ContentBlock[] = []
    let currentBlock: ContentBlock | null = null

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (!trimmedLine) {
        if (currentBlock) {
          blocks.push(currentBlock)
          currentBlock = null
        }
        continue
      }

      // Detect headings
      if (trimmedLine.startsWith('#')) {
        if (currentBlock) blocks.push(currentBlock)
        const level = trimmedLine.match(/^#+/)?.[0].length || 1
        currentBlock = {
          type: 'heading',
          content: trimmedLine.replace(/^#+\s*/, ''),
          level
        }
        continue
      }

      // Detect code blocks
      if (trimmedLine.startsWith('```')) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'code',
          content: trimmedLine
        }
        continue
      }

      // Detect inline code (single backticks)
      if (trimmedLine.includes('`') && !trimmedLine.startsWith('```') && !trimmedLine.includes('```')) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'code',
          content: trimmedLine
        }
        continue
      }

      // Detect lists
      if (trimmedLine.match(/^[-*+]\s/)) {
        if (currentBlock?.type === 'list') {
          currentBlock.items = currentBlock.items || []
          currentBlock.items.push(trimmedLine.replace(/^[-*+]\s/, ''))
        } else {
          if (currentBlock) blocks.push(currentBlock)
          currentBlock = {
            type: 'list',
            content: 'List',
            items: [trimmedLine.replace(/^[-*+]\s/, '')]
          }
        }
        continue
      }

      // Detect examples, tips, warnings
      if (trimmedLine.toLowerCase().includes('example') || trimmedLine.toLowerCase().includes('sample')) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'example',
          content: trimmedLine
        }
        continue
      }

      if (trimmedLine.toLowerCase().includes('tip') || trimmedLine.toLowerCase().includes('hint')) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'tip',
          content: trimmedLine
        }
        continue
      }

      if (trimmedLine.toLowerCase().includes('warning') || trimmedLine.toLowerCase().includes('caution')) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'warning',
          content: trimmedLine
        }
        continue
      }

      if (trimmedLine.toLowerCase().includes('summary') || trimmedLine.toLowerCase().includes('recap')) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'summary',
          content: trimmedLine
        }
        continue
      }

      // Regular paragraph
      if (currentBlock?.type === 'paragraph') {
        currentBlock.content += ' ' + trimmedLine
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'paragraph',
          content: trimmedLine
        }
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock)
    }

    return blocks
  }

  const blocks = parseContent(content)

  const renderBlock = (block: ContentBlock, index: number) => {
    const animationDelay = index * 0.1

    switch (block.type) {
      case 'heading':
        const renderHeading = () => {
          const level = Math.min(block.level || 2, 6)
          const className = cn(
            "font-bold text-foreground",
            level === 1 && "text-3xl",
            level === 2 && "text-2xl",
            level === 3 && "text-xl",
            level === 4 && "text-lg"
          )
          
          switch (level) {
            case 1:
              return <h1 className={className}>{block.content}</h1>
            case 2:
              return <h2 className={className}>{block.content}</h2>
            case 3:
              return <h3 className={className}>{block.content}</h3>
            case 4:
              return <h4 className={className}>{block.content}</h4>
            case 5:
              return <h5 className={className}>{block.content}</h5>
            default:
              return <h6 className={className}>{block.content}</h6>
          }
        }
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                {block.level === 1 && <BookOpen className="h-6 w-6 text-primary" />}
                {block.level === 2 && <Target className="h-5 w-5 text-primary" />}
                {block.level === 3 && <Zap className="h-4 w-4 text-primary" />}
                {block.level === 4 && <Star className="h-4 w-4 text-primary" />}
              </div>
              {renderHeading()}
            </div>
          </motion.div>
        )

      case 'paragraph':
        return (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="text-foreground/90 leading-relaxed mb-4 text-base break-words overflow-wrap-anywhere"
          >
            {block.content}
          </motion.p>
        )

      case 'code':
        const isInline = block.content.startsWith('`') && block.content.endsWith('`')
        if (isInline) {
          return (
            <motion.code
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animationDelay, duration: 0.3 }}
              className="bg-muted/50 text-primary px-2 py-1 rounded-md text-sm font-mono break-all"
            >
              {block.content.replace(/`/g, '')}
            </motion.code>
          )
        }
        
        // Handle multi-line code blocks
        const codeContent = block.content.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
        const language = block.content.match(/^```(\w+)/)?.[1] || 'text'
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-4"
          >
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Code Example</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                    {language}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gray-900 dark:bg-gray-950 rounded-b-lg overflow-hidden">
                  <pre className="text-sm text-gray-100 p-4 overflow-x-auto whitespace-pre-wrap break-words">
                    <code className="font-mono">{codeContent}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'list':
        return (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-4"
          >
            <ul className="space-y-2">
              {block.items?.map((item, itemIndex) => (
                <motion.li
                  key={itemIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: animationDelay + itemIndex * 0.1, duration: 0.3 }}
                  className="flex items-start gap-3 text-foreground/90"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="break-words overflow-wrap-anywhere">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )

      case 'example':
        const exampleIndex = index
        const isExpanded = expandedExamples.has(exampleIndex)
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        Practical Example
                      </CardTitle>
                      <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                        Real-world application
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newExpanded = new Set(expandedExamples)
                      if (isExpanded) {
                        newExpanded.delete(exampleIndex)
                      } else {
                        newExpanded.add(exampleIndex)
                      }
                      setExpandedExamples(newExpanded)
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-blue-900/90 dark:text-blue-100/90 break-words overflow-wrap-anywhere">
                    {block.content}
                  </p>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Placeholder for interactive example */}
                      <div className="bg-white/50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900 dark:text-blue-100">Interactive Demo</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm text-gray-600 dark:text-gray-400">
                          🎯 Interactive example would be embedded here
                        </div>
                      </div>
                      
                      {/* Visual representation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">Before</span>
                          </div>
                          <div className="text-sm text-blue-800/80 dark:text-blue-200/80">
                            Traditional approach
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">After</span>
                          </div>
                          <div className="text-sm text-blue-800/80 dark:text-blue-200/80">
                            Improved approach
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'tip':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-4"
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-green-800/90 dark:text-green-200/90 break-words overflow-wrap-anywhere">
                      {block.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'warning':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-4"
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Important Note
                    </h4>
                    <p className="text-yellow-800/90 dark:text-yellow-200/90 break-words overflow-wrap-anywhere">
                      {block.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'summary':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                      Key Takeaways
                    </CardTitle>
                    <p className="text-sm text-purple-700/80 dark:text-purple-300/80">
                      What you've learned
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-800/90 dark:text-purple-200/90 break-words overflow-wrap-anywhere">
                  {block.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay, duration: 0.5 }}
            className="text-foreground/90 leading-relaxed mb-4 break-words overflow-wrap-anywhere"
          >
            {block.content}
          </motion.p>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="text-xs">
          Step {stepNumber} of {totalSteps}
        </Badge>
        <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Enhanced content */}
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div key={index}>
            {renderBlock(block, index)}
          </div>
        ))}
      </div>

      {/* Interactive elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50"
      >
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Learning Checkpoint</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Take a moment to reflect on what you've learned in this step.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            ✓ Understanding
          </Badge>
          <Badge variant="outline" className="text-xs">
            ✓ Application
          </Badge>
          <Badge variant="outline" className="text-xs">
            ✓ Practice
          </Badge>
        </div>
      </motion.div>
    </div>
  )
}
