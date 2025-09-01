'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Sparkles,
  User,
  Bot,
  BookOpen,
  Video
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { vapi } from '@/lib/vapi.sdk'
import { AI_TUTOR_CONFIG, AI_TUTOR_PROMPTS } from '@/constants'
import TopicSelector from '@/components/ai-tutor/TopicSelector'

interface AiTutorSessionProps {
  className?: string
}

export function AiTutorSession({ className }: AiTutorSessionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('session')
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedSubtopic, setSelectedSubtopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner')
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

  const handleTopicSelect = (topicId: string, subtopic: string, difficulty: string) => {
    setSelectedTopic(topicId)
    setSelectedSubtopic(subtopic)
    setSelectedDifficulty(difficulty)
    setActiveTab('session')
    
    // Generate conversation ID
    const newConversationId = `ai-tutor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setConversationId(newConversationId)
    
    toast({
      title: "Topic Selected",
      description: `Ready to learn about ${subtopic || topicId}`,
    })
  }

  const handleStartCall = async () => {
    if (!selectedTopic) {
      toast({
        title: "No Topic Selected",
        description: "Please select a learning topic first",
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
      
      console.log('Starting VAPI call with workflow:', process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID)
      console.log('Call variables:', {
        username: user?.name || 'Student',
        userid: user?.id || '',
        conversationid: conversationId,
        topic: selectedSubtopic || selectedTopic,
        voice: AI_TUTOR_CONFIG.voice,
        assistant_name: AI_TUTOR_CONFIG.assistant.name,
        welcome_message: AI_TUTOR_PROMPTS.welcome
      })
      
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
            conversationid: conversationId,
            topic: selectedSubtopic || selectedTopic,
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
      
      // Reset after a delay
      setTimeout(() => {
        setCallStatus('idle')
        setCallDuration(0)
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
      // This ensures the user knows the AI is ready
      setTimeout(() => {
        setIsAISpeaking(true)
        // Keep speaking indicator active for a few seconds to show AI is greeting
        setTimeout(() => setIsAISpeaking(false), 4000)
      }, 1000)
    }

    const onCallEnd = () => {
      console.log('VAPI call ended')
      setCallStatus('ended')
      setCallDuration(0)
      
      // Reset after a delay
      setTimeout(() => {
        setCallStatus('idle')
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
  }, [toast])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-foreground" />
          AI Tutor Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Learning Session
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Select Topic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="space-y-6">
            {/* Session Header */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">AI Learning Session</h3>
              {selectedTopic ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Learning about: <span className="font-medium text-foreground">{selectedSubtopic || selectedTopic}</span>
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Level
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">Select a topic to begin your learning session</p>
              )}
              
              {/* Microphone Permission Status */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Mic className="w-3 h-3" />
                <span>Microphone access required for voice learning</span>
              </div>
              
              {callStatus === 'active' && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{formatDuration(callDuration)}</span>
                </div>
              )}
            </div>

            {/* Call Interface */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* User Side */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full bg-foreground flex items-center justify-center ${isUserSpeaking ? 'ring-4 ring-foreground/20 animate-pulse' : ''}`}>
                      <User className="w-10 h-10 text-background" />
                    </div>
                    {isUserSpeaking && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Mic className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground">{user?.name || 'You'}</h4>
                    <p className="text-sm text-muted-foreground">Student</p>
                    {callStatus === 'active' && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Speak naturally to ask questions
                      </div>
                    )}
                  </div>
                  {isUserSpeaking && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-6 bg-foreground rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Side */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full bg-muted flex items-center justify-center ${isAISpeaking ? 'ring-4 ring-muted/50 animate-pulse' : ''}`}>
                      <Bot className="w-10 h-10 text-foreground" />
                    </div>
                    {isAISpeaking && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground">{AI_TUTOR_CONFIG.assistant.name}</h4>
                    <p className="text-sm text-muted-foreground">AI Tutor</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {AI_TUTOR_CONFIG.voice}
                    </Badge>
                    {callStatus === 'active' && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Listening and responding
                      </div>
                    )}
                  </div>
                  {isAISpeaking && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-6 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {callStatus !== 'active' ? (
                <Button
                  onClick={handleStartCall}
                  disabled={callStatus === 'connecting' || !selectedTopic}
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3"
                  size="lg"
                >
                  {callStatus === 'connecting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
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
                    className="px-6 py-3"
                  >
                    {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  
                  <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    size="lg"
                    className="px-6 py-3"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>

            {/* Session Info */}
            {selectedTopic && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Topic: <span className="font-medium text-foreground">{selectedSubtopic || selectedTopic}</span></p>
                <p>Difficulty: <span className="font-medium text-foreground">{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</span></p>
              </div>
            )}
            
            {/* Connection Status Info */}
            {callStatus === 'connecting' && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Requesting microphone permission...</p>
                <p>Please allow microphone access when prompted</p>
              </div>
            )}
            
            {callStatus === 'active' && (
              <div className="text-center text-sm text-muted-foreground">
                <p>🎤 Session active - Speak naturally to interact with Alisha</p>
                <p>💡 Ask questions, request explanations, or discuss topics</p>
              </div>
            )}
            
            {/* VAPI Configuration Help */}
            <div className="bg-muted/20 border border-border rounded-lg p-4">
              <div className="text-center space-y-2">
                <h4 className="font-medium text-foreground">VAPI Configuration Status</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Workflow ID: {process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID ? '✅ Configured' : '❌ Missing'}</p>
                  <p>Web Token: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? '✅ Configured' : '❌ Missing'}</p>
                </div>
                {(!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID || !process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) && (
                  <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                    <p className="font-medium">Configuration Issue Detected</p>
                    <p>Please check your .env.local file for VAPI credentials</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <TopicSelector 
              onTopicSelect={handleTopicSelect}
              isLoading={false}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
