'use client'

import React, { useEffect, useRef } from 'react'
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
  Award,
  Copy,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'

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
  language?: string
  codeContent?: string
}

export function EnhancedContent({ content, stepNumber, totalSteps }: EnhancedContentProps) {
  const [expandedExamples, setExpandedExamples] = React.useState<Set<number>>(new Set())
  const [copiedCode, setCopiedCode] = React.useState<Set<number>>(new Set())
  const codeRefs = useRef<{ [key: number]: HTMLPreElement | null }>({})

  // Highlight code blocks when component mounts or content changes
  useEffect(() => {
    // Highlight all code blocks
    Object.values(codeRefs.current).forEach((ref) => {
      if (ref) {
        Prism.highlightElement(ref)
      }
    })
  }, [content])

  const handleCopyCode = async (codeContent: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeContent)
      setCopiedCode(prev => new Set(prev).add(index))
      setTimeout(() => {
        setCopiedCode(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  // Helper function to detect and format plain text code
  const detectAndFormatCode = (text: string): string => {
    // Common code patterns to detect
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /if\s*\(/,
      /for\s*\(/,
      /while\s*\(/,
      /class\s+\w+/,
      /import\s+/,
      /export\s+/,
      /return\s+/,
      /console\.log/,
      /def\s+\w+/,
      /print\s*\(/,
      /\.css\s*{/,
      /\.js\s*{/,
      /\.ts\s*{/,
      /\.py\s*{/
    ]
    
    const lines = text.split('\n')
    const hasCodePattern = lines.some(line => 
      codePatterns.some(pattern => pattern.test(line.trim()))
    )
    
    if (hasCodePattern && lines.length > 2) {
      // Determine language based on content
      let language = 'text'
      if (text.includes('function') || text.includes('const') || text.includes('console.log')) language = 'javascript'
      else if (text.includes('def ') || text.includes('print(')) language = 'python'
      else if (text.includes('.css') || text.includes('{')) language = 'css'
      else if (text.includes('interface') || text.includes(': string')) language = 'typescript'
      
      return `\`\`\`${language}\n${text}\n\`\`\``
    }
    
    return text
  }

  // Parse markdown content into structured blocks
  const parseContent = (content: string): ContentBlock[] => {
    // First, detect and format any plain text code
    const formattedContent = detectAndFormatCode(content)
    const lines = formattedContent.split('\n')
    const blocks: ContentBlock[] = []
    let currentBlock: ContentBlock | null = null
    let inCodeBlock = false
    let codeBlockLanguage = ''
    let codeBlockContent: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Handle code block start
      if (line.startsWith('```') && !inCodeBlock) {
        if (currentBlock) blocks.push(currentBlock)
        
        // Extract language from the opening ```
        const languageMatch = line.match(/^```(\w+)?/)
        codeBlockLanguage = languageMatch?.[1] || 'text'
        
        inCodeBlock = true
        codeBlockContent = []
        currentBlock = null
        continue
      }
      
      // Handle code block end
      if (line.startsWith('```') && inCodeBlock) {
        inCodeBlock = false
        // Join with newlines to preserve line breaks and indentation
        // Also normalize tabs to spaces for consistent display
        const codeContent = codeBlockContent
          .join('\n')
          .replace(/\t/g, '  ') // Replace tabs with 2 spaces
        
        blocks.push({
          type: 'code',
          content: `\`\`\`${codeBlockLanguage}\n${codeContent}\n\`\`\``,
          language: codeBlockLanguage,
          codeContent: codeContent
        })
        
        codeBlockContent = []
        codeBlockLanguage = ''
        continue
      }
      
      // Collect code block content - preserve original line structure
      if (inCodeBlock) {
        // Don't trim the line - preserve original indentation and spacing
        codeBlockContent.push(line)
        continue
      }
      
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

    // Handle any remaining code block
    if (inCodeBlock && codeBlockContent.length > 0) {
      const codeContent = codeBlockContent.join('\n')
      blocks.push({
        type: 'code',
        content: `\`\`\`${codeBlockLanguage}\n${codeContent}\n\`\`\``,
        language: codeBlockLanguage,
        codeContent: codeContent
      })
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
        
        // Handle multi-line code blocks with syntax highlighting
        const codeContent = block.codeContent || block.content.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
        const language = block.language || block.content.match(/^```(\w+)/)?.[1] || 'text'
        const isCopied = copiedCode.has(index)
        
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
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      {language}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(codeContent, index)}
                      className="h-8 w-8 p-0 hover:bg-muted/50"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gray-900 dark:bg-gray-950 rounded-b-lg overflow-hidden">
                  <pre 
                    ref={(el) => {
                      codeRefs.current[index] = el
                    }}
                    className="text-sm p-4 overflow-x-auto"
                    style={{ 
                      background: 'transparent',
                      margin: 0,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      whiteSpace: 'pre',
                      wordBreak: 'normal',
                      overflowWrap: 'normal'
                    }}
                  >
                    <code className={`language-${language}`}>
                      {codeContent}
                    </code>
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
