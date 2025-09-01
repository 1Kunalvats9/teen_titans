'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Sparkles,
  User,
  Bot,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { vapi } from '@/lib/vapi.sdk'
import { AI_TUTOR_CONFIG, AI_TUTOR_PROMPTS } from '@/constants'

export default function AiTutorSessionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [conversationId, setConversationId] = useState('')

  // Start call timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callStatus])

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Auto-start session when page loads
  useEffect(() => {
    if (user && callStatus === 'idle') {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        handleStartCall()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [user])

  const handleStartCall = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start an AI tutor session",
        variant: "destructive",
      })
      return
    }

    // Check if VAPI workflow ID is configured
    if (!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID) {
      toast({
        title: "Configuration Error",
        description: "VAPI workflow ID is not configured. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    try {
      setCallStatus('connecting')
      
      // Request microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Stop the stream after getting permission
        console.log('Microphone permission granted')
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError)
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access to start the AI tutor session",
          variant: "destructive",
        })
        setCallStatus('idle')
        return
      }
      
      // Generate conversation ID
      const newConversationId = `ai-tutor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setConversationId(newConversationId)
      
      console.log('Starting VAPI call with workflow:', process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID)
      
      // Validate VAPI configuration
      if (!vapi) {
        throw new Error('VAPI SDK not initialized')
      }
      
      // Check if there's an active call and stop it
      try {
        await vapi.stop()
        console.log('Stopped any existing VAPI call')
      } catch (stopError) {
        // Ignore errors when stopping (might not be active)
        console.log('No active call to stop')
      }
      
      try {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: user?.name || 'Student',
            userid: user?.id || '',
            conversationid: newConversationId,
            topic: 'general learning and assistance',
            voice: AI_TUTOR_CONFIG.voice,
            assistant_name: AI_TUTOR_CONFIG.assistant.name,
            welcome_message: AI_TUTOR_PROMPTS.welcome,
            // Add additional variables to ensure the workflow starts speaking
            start_conversation: true,
            user_first_message: false,
            ai_greeting: true
          },
        })
        
        console.log('VAPI start() called successfully')
      } catch (vapiError: any) {
        console.error('VAPI start() failed:', vapiError)
        throw new Error(`VAPI workflow failed to start: ${vapiError?.message || 'Unknown error'}`)
      }

      setCallStatus('active')
      toast({
        title: "AI Tutor Connected!",
        description: "Alisha is ready to help you learn. She'll start speaking shortly.",
      })
      
      // Force AI speaking indicator to show that the AI is starting
      setTimeout(() => {
        setIsAISpeaking(true)
        // Keep it active for longer to show the AI is greeting
        setTimeout(() => setIsAISpeaking(false), 5000)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to start call:', error)
      setCallStatus('idle')
      toast({
        title: "Connection Failed",
        description: "Failed to connect to AI tutor. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEndCall = async () => {
    try {
      await vapi.stop()
      setCallStatus('ended')
      toast({
        title: "Session Ended",
        description: "Your AI tutor session has ended",
      })
      
      // Redirect back to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to end call:', error)
      toast({
        title: "Error",
        description: "Failed to end session properly",
        variant: "destructive",
      })
    }
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    toast({
      title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
      description: isMuted ? "Your microphone is now active" : "Your microphone is now muted",
    })
  }

  // Add VAPI event listeners
  useEffect(() => {
    const onCallStart = () => {
      console.log('VAPI call started')
      setCallStatus('active')
      
      // Simulate AI speaking immediately after call starts
      setTimeout(() => {
        setIsAISpeaking(true)
        setTimeout(() => setIsAISpeaking(false), 4000)
      }, 1000)
    }

    const onCallEnd = () => {
      console.log('VAPI call ended')
      setCallStatus('ended')
      setCallDuration(0)
      
      // Redirect back to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }

    const onMessage = (message: any) => {
      console.log('VAPI message received:', message)
      if (message.type === "transcript" && message.transcriptType === "final") {
        // Handle user speech
        setIsUserSpeaking(true)
        setTimeout(() => setIsUserSpeaking(false), 2000)
      }
    }

    const onSpeechStart = () => {
      console.log("AI speech start")
      setIsAISpeaking(true)
    }

    const onSpeechEnd = () => {
      console.log("AI speech end")
      setIsAISpeaking(false)
    }

    const onError = (error: any) => {
      console.error('VAPI error details:', {
        error,
        errorMessage: error?.message,
        errorName: error?.name,
        errorStack: error?.stack,
        errorType: typeof error,
        errorKeys: Object.keys(error || {}),
        timestamp: new Date().toISOString()
      })
      
      // Log additional error details if available
      if (error?.error) {
        console.error('VAPI API error details:', {
          status: error.error.status,
          statusText: error.error.statusText,
          url: error.error.url,
          data: error.error.data,
          response: error.error
        })
      }
      
      let errorMessage = "An unknown error occurred during the AI conversation"
      let errorTitle = "AI Conversation Error"
      
      // Check for specific VAPI errors
      if (error?.context?.hasWorkflow === false) {
        errorTitle = "VAPI Workflow Not Found"
        errorMessage = "The AI tutor workflow is not configured. Please check your VAPI workflow ID."
      } else if (error?.stage === "start-method-error") {
        errorTitle = "Workflow Start Failed"
        errorMessage = "Failed to start the AI tutor workflow. The workflow ID may be invalid or expired."
      } else if (error?.error?.status === 400) {
        errorTitle = "VAPI Configuration Error"
        if (error?.error?.data?.message) {
          errorMessage = `VAPI API Error: ${error.error.data.message}`
        } else if (error?.error?.data?.error) {
          errorMessage = `VAPI API Error: ${error.error.data.error}`
        } else {
          errorMessage = "Invalid workflow configuration. The workflow ID may be invalid, expired, or misconfigured."
        }
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = Object.values(error).filter(v => v).join(', ') || "Configuration or connection error"
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
      setCallStatus('idle')
    }

    // Set up VAPI event listeners
    vapi.on("call-start", onCallStart)
    vapi.on("call-end", onCallEnd)
    vapi.on("message", onMessage)
    vapi.on("speech-start", onSpeechStart)
    vapi.on("speech-end", onSpeechEnd)
    vapi.on("error", onError)

    // Cleanup event listeners
    return () => {
      vapi.off("call-start", onCallStart)
      vapi.off("call-end", onCallEnd)
      vapi.off("message", onMessage)
      vapi.off("speech-start", onSpeechStart)
      vapi.off("speech-end", onSpeechEnd)
      vapi.off("error", onError)
    }
  }, [toast, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Authentication Required</div>
          <div className="text-muted-foreground">Please log in to access the AI tutor session</div>
          <button 
            onClick={() => router.push('/login')} 
            className="text-primary hover:text-primary/80 cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-foreground" />
              <span className="font-semibold">AI Tutor Session</span>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Session Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">AI Learning Session with Alisha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Session Status */}
            <div className="text-center space-y-2">
              {callStatus === 'connecting' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                    <span className="text-foreground">Connecting to AI Tutor...</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Requesting microphone permission...</p>
                </div>
              )}
              
              {callStatus === 'active' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{formatDuration(callDuration)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">🎤 Session active - Speak naturally to interact with Alisha</p>
                </div>
              )}
            </div>

            {/* Call Interface */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* User Side */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full bg-foreground flex items-center justify-center ${isUserSpeaking ? 'ring-4 ring-foreground/20 animate-pulse' : ''}`}>
                      <User className="w-12 h-12 text-background" />
                    </div>
                    {isUserSpeaking && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground text-lg">{user?.name || 'You'}</h4>
                    <p className="text-sm text-muted-foreground">Student</p>
                    {callStatus === 'active' && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Speak naturally to ask questions
                      </div>
                    )}
                  </div>
                  {isUserSpeaking && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-8 bg-foreground rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Side */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full bg-muted flex items-center justify-center ${isAISpeaking ? 'ring-4 ring-muted/50 animate-pulse' : ''}`}>
                      <Bot className="w-12 h-12 text-foreground" />
                    </div>
                    {isAISpeaking && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground text-lg">{AI_TUTOR_CONFIG.assistant.name}</h4>
                    <p className="text-sm text-muted-foreground">AI Tutor</p>
                    <Badge variant="secondary" className="mt-2">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {AI_TUTOR_CONFIG.voice}
                    </Badge>
                    {callStatus === 'active' && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Listening and responding
                      </div>
                    )}
                  </div>
                  {isAISpeaking && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-8 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {callStatus !== 'active' ? (
                <Button
                  onClick={handleStartCall}
                  disabled={callStatus === 'connecting'}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 text-lg"
                  size="lg"
                >
                  {callStatus === 'connecting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Start Learning Session
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleToggleMute}
                    variant={isMuted ? "destructive" : "outline"}
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    {isMuted ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  
                  <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>

            {/* Session Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>💡 Ask Alisha anything - she's here to help you learn!</p>
              <p>🎯 No topic selection needed - just start speaking naturally</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
