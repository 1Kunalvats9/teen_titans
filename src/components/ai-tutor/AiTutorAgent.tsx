"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { vapi } from "@/lib/vapi.sdk"
import { AI_TUTOR_CONFIG, AI_TUTOR_PROMPTS } from "@/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, MessageCircle, BookOpen, Sparkles } from "lucide-react"

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant"
  content: string
}

interface AiTutorAgentProps {
  userName: string
  userId: string
  conversationId: string
  topic?: string
  onMessageUpdate?: (messages: SavedMessage[]) => void
}

const AiTutorAgent = ({
  userName,
  userId,
  conversationId,
  topic,
  onMessageUpdate
}: AiTutorAgentProps) => {
  const router = useRouter()
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastMessage, setLastMessage] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE)
    }

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED)
    }

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript }
        setMessages((prev) => [...prev, newMessage])
        onMessageUpdate?.([...messages, newMessage])
      }
    }

    const onSpeechStart = () => {
      console.log("speech start")
      setIsSpeaking(true)
    }

    const onSpeechEnd = () => {
      console.log("speech end")
      setIsSpeaking(false)
    }

    const onError = (error: Error) => {
      console.log("Error:", error)
    }

    vapi.on("call-start", onCallStart)
    vapi.on("call-end", onCallEnd)
    vapi.on("message", onMessage)
    vapi.on("speech-start", onSpeechStart)
    vapi.on("speech-end", onSpeechEnd)
    vapi.on("error", onError)

    return () => {
      vapi.off("call-start", onCallStart)
      vapi.off("call-end", onCallEnd)
      vapi.off("message", onMessage)
      vapi.off("speech-start", onSpeechStart)
      vapi.off("speech-end", onSpeechEnd)
      vapi.off("error", onError)
    }
  }, [messages, onMessageUpdate])

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content)
    }
  }, [messages])

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING)

    // Use VAPI workflow for AI tutor
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
      variableValues: {
        username: userName,
        userid: userId,
        conversationid: conversationId,
        topic: topic || "general learning",
        voice: AI_TUTOR_CONFIG.voice,
        assistant_name: AI_TUTOR_CONFIG.assistant.name,
        welcome_message: AI_TUTOR_PROMPTS.welcome
      },
    })
  }

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED)
    vapi.stop()
  }

  const handleTextMessage = async (message: string) => {
    if (!message.trim()) return

    setIsTyping(true)
    const userMessage = { role: "user" as const, content: message }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch(`/api/ai-tutor/conversation/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = { role: "assistant" as const, content: data.aiMessage.content }
        setMessages((prev) => [...prev, aiMessage])
        onMessageUpdate?.([...messages, userMessage, aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg border-b">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            {isSpeaking && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{AI_TUTOR_CONFIG.assistant.name}</h2>
            <p className="text-sm text-muted-foreground">{AI_TUTOR_CONFIG.assistant.role}</p>
            {topic && (
              <Badge variant="secondary" className="mt-1">
                <BookOpen className="w-3 h-3 mr-1" />
                {topic}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {callStatus === CallStatus.ACTIVE ? "Connected" : "Ready to learn"}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/20">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Start Learning with Alisha</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click the call button below to start your learning session. Alisha will guide you through concepts, 
              provide examples, and answer your questions in a friendly, patient manner.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-gradient-to-r from-background to-muted/10 border-t">
        <div className="flex justify-center">
          {callStatus !== CallStatus.ACTIVE ? (
            <Button
              size="lg"
              onClick={handleCall}
              disabled={callStatus === CallStatus.CONNECTING}
              className="relative bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-full shadow-lg"
            >
              {callStatus === CallStatus.CONNECTING && (
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              )}
              <span className="relative flex items-center space-x-2">
                {callStatus === CallStatus.CONNECTING ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Start Learning Session</span>
                  </>
                )}
              </span>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={handleDisconnect}
              className="px-8 py-3 rounded-full shadow-lg"
            >
              <MicOff className="w-5 h-5 mr-2" />
              End Session
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AiTutorAgent
