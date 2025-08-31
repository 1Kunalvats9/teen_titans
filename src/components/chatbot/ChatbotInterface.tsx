'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Upload, 
  Image as ImageIcon, 
  Bot, 
  User, 
  Sparkles, 
  Calculator, 
  Camera,
  FileText,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Paperclip
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatbotInterfaceProps {
  user: any
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
  toolUsed?: string
}

export function ChatbotInterface({ user }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI learning assistant. I can help you with:\n\n• Solving problems step-by-step\n• Analyzing images and questions\n• Explaining concepts clearly\n• Providing detailed explanations\n\nHow can I help you today?`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !uploadedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      imageUrl: uploadedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setUploadedImage(null)
    setIsLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          imageUrl: uploadedImage,
          userId: user.id,
          userName: user.name
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolUsed: data.toolUsed
      }

      // Log the response for debugging
      console.log('Chatbot response:', {
        toolUsed: data.toolUsed,
        imageAnalysis: data.imageAnalysis,
        responseLength: data.response?.length
      })

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      toast.success('Image uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast.success('Message copied to clipboard!')
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessageContent = (message: Message) => {
    if (message.imageUrl) {
      return (
        <div className="space-y-3">
          <img 
            src={message.imageUrl} 
            alt="Uploaded question" 
            className="max-w-full h-auto rounded-lg border border-border/50 shadow-sm"
          />
          {message.content && (
            <p className="text-sm text-muted-foreground">{message.content}</p>
          )}
        </div>
      )
    }

    // Clean and format the content for better readability
    const cleanContent = message.content
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold** markers
      .replace(/\*([^*]+)\*/g, '$1') // Remove *italic* markers
      .replace(/`([^`]+)`/g, '$1') // Remove `code` markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [link](url) format
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks

    // Split content into paragraphs and format
    const paragraphs = cleanContent.split('\n\n').filter(p => p.trim())
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-relaxed text-foreground">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] max-w-4xl mx-auto">
      {/* Messages Area - Centered and Scrollable */}
      <div className="flex-1 overflow-hidden rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[85%] space-y-2",
                  message.role === 'user' ? 'order-1' : 'order-2'
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 shadow-sm",
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 text-foreground border border-border/30'
                  )}>
                    {renderMessageContent(message)}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>{formatTimestamp(message.timestamp)}</span>
                    <div className="flex items-center space-x-2">
                      {message.toolUsed && (
                        <Badge variant="outline" className="text-xs bg-background/50">
                          {message.toolUsed === 'problem_solver' && <Calculator className="w-3 h-3 mr-1" />}
                          {message.toolUsed === 'image_analyzer' && <Camera className="w-3 h-3 mr-1" />}
                          {message.toolUsed === 'general_chat' && <Sparkles className="w-3 h-3 mr-1" />}
                          {message.toolUsed.replace('_', ' ')}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted/50"
                        onClick={() => copyMessage(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/30">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="mt-4 p-4 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm">
        {/* Image Upload Preview */}
        {uploadedImage && (
          <div className="mb-3 relative inline-block">
            <img 
              src={uploadedImage} 
              alt="Preview" 
              className="max-h-32 rounded-lg border border-border/50 shadow-sm"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              onClick={() => setUploadedImage(null)}
            >
              ×
            </Button>
          </div>
        )}

        {/* Input and Buttons */}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything or upload an image of a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px] max-h-[120px] resize-none border-border/50 bg-background/50 rounded-xl pr-12"
              disabled={isLoading}
              rows={1}
            />
            
            {/* Upload Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !uploadedImage) || isLoading}
            className="h-[44px] w-[44px] p-0 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            <Calculator className="w-3 h-3 mr-1" />
            Problem Solver
          </Badge>
          <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary">
            <Camera className="w-3 h-3 mr-1" />
            Image Analysis
          </Badge>
          <Badge variant="secondary" className="text-xs bg-muted/50">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>
    </div>
  )
}
