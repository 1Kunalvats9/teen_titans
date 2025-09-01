'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Sparkles,
  User,
  Bot,
  RotateCcw,
  Settings,
  MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { AI_TUTOR_CONFIG } from '@/constants'

interface VapiVoiceWidgetProps {
  onEndCall?: () => void
}

export const VapiVoiceWidget: React.FC<VapiVoiceWidgetProps> = ({
  onEndCall
}) => {
  const { user } = useAuth()
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcripts, setTranscripts] = useState<Array<{role: string, text: string, timestamp: Date}>>([])
  const [showTranscripts, setShowTranscripts] = useState(false)
  const durationRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const vapiRef = useRef<any>(null)
  
  // Time limit constants (1.2 minutes = 72 seconds)
  const CALL_TIME_LIMIT = 72 // seconds
  const WARNING_TIME = 60 // Show warning at 1 minute

  // Initialize Vapi
  useEffect(() => {
    const initVapi = async () => {
      try {
        const { default: Vapi } = await import('@vapi-ai/web')
        
        if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
          toast.error('Vapi public key not configured')
          return
        }

        vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)
        
        // Set up event listeners
        vapiRef.current.on('call-start', () => {
          console.log('Call started')
          setCallStatus('active')
          toast.success('Call connected! Start speaking with your AI tutor.')
        })

        vapiRef.current.on('call-end', () => {
          console.log('Call ended')
          setCallStatus('ended')
          toast.info('Call ended')
          if (onEndCall) onEndCall()
        })

        vapiRef.current.on('message', (message: any) => {
          if (message.type === 'transcript') {
            const newTranscript = {
              role: message.role,
              text: message.transcript,
              timestamp: new Date()
            }
            setTranscripts(prev => [...prev, newTranscript])
            
            // Update speaking indicators with stable timing
            if (message.role === 'user') {
              setIsUserSpeaking(true)
              // Keep speaking indicator stable for longer duration
              setTimeout(() => setIsUserSpeaking(false), 4000)
            } else if (message.role === 'assistant') {
              setIsAISpeaking(true)
              // Keep speaking indicator stable for longer duration
              setTimeout(() => setIsAISpeaking(false), 5000)
            }
          }
        })

        vapiRef.current.on('error', (error: any) => {
          console.error('Vapi error:', error)
          toast.error('Call error occurred. Please try again.')
          setCallStatus('idle')
        })

      } catch (error) {
        console.error('Failed to initialize Vapi:', error)
        toast.error('Failed to initialize voice system')
      }
    }

    initVapi()

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [onEndCall])

  // Start call timer
  useEffect(() => {
    if (callStatus === 'active') {
      durationRef.current = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1
          
          // Show warning at 1 minute
          if (newDuration === WARNING_TIME) {
            toast.warning('⚠️ 1 minute remaining. Call will end automatically in 12 seconds due to free tier limits.')
          }
          
          // Auto-end call at time limit
          if (newDuration >= CALL_TIME_LIMIT) {
            handleEndCall()
            toast.info('⏰ Call time limit reached (1.2 minutes). Due to limited free tokens, call limit is set to 1.2 minutes only.')
            return CALL_TIME_LIMIT
          }
          
          return newDuration
        })
      }, 1000)
    } else {
      if (durationRef.current) {
        clearInterval(durationRef.current)
      }
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current)
      }
    }
  }, [callStatus])

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartCall = async () => {
    if (!vapiRef.current) {
      toast.error('Voice system not initialized')
      return
    }

    if (!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
      toast.error('Vapi assistant ID not configured')
      return
    }

    try {
      setCallStatus('connecting')
      setTranscripts([])
      setCallDuration(0)
      
      await vapiRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID, {
        metadata: {
          username: user?.name || 'Student',
          userid: user?.id || '',
          topic: 'Learning Session',
          assistant_name: AI_TUTOR_CONFIG.assistant.name
        }
      })
    } catch (error) {
      console.error('Failed to start call:', error)
      setCallStatus('idle')
      toast.error('Failed to connect call. Please try again.')
    }
  }

  const handleEndCall = async () => {
    if (!vapiRef.current) return

    try {
      await vapiRef.current.stop()
      setCallStatus('ended')
      toast.success('Call ended')
    } catch (error) {
      console.error('Failed to end call:', error)
      toast.error('Failed to end call properly')
    }
  }

  const handleToggleMute = () => {
    if (!vapiRef.current) return
    
    try {
      if (isMuted) {
        vapiRef.current.unmute()
        setIsMuted(false)
        toast.info('Microphone unmuted')
      } else {
        vapiRef.current.mute()
        setIsMuted(true)
        toast.info('Microphone muted')
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error)
    }
  }

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
    toast.info(isSpeakerOn ? 'Speaker off' : 'Speaker on')
  }

  const handleCallAgain = () => {
    setCallStatus('idle')
    setTranscripts([])
    setCallDuration(0)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      {/* Call Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">AI Tutor Voice Chat</h2>
          <p className="text-muted-foreground">Start a voice conversation with your AI tutor</p>
          {callStatus === 'active' && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Connected</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{formatDuration(callDuration)}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className={`text-sm font-medium ${
                callDuration >= WARNING_TIME ? 'text-orange-600' : 'text-muted-foreground'
              }`}>
                {formatDuration(CALL_TIME_LIMIT - callDuration)} remaining
              </span>
            </div>
          )}
          
          {/* Time Progress Bar */}
          {callStatus === 'active' && (
            <div className="mt-2 w-full max-w-xs mx-auto">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    callDuration >= WARNING_TIME ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(callDuration / CALL_TIME_LIMIT) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0:00</span>
                <span className={callDuration >= WARNING_TIME ? 'text-orange-600 font-medium' : ''}>
                  {formatDuration(callDuration)}
                </span>
                <span>1:12</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Interface */}
      <Card className="w-full max-w-4xl bg-background/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* User Side */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-black text-white border-2 border-border flex items-center justify-center ${isUserSpeaking ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}>
                  <User className="w-12 h-12 text-foreground" />
                </div>
                {isUserSpeaking && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Mic className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{user?.name || 'You'}</h3>
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
              {isUserSpeaking && (
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-foreground/60 rounded-full"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Side */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-black text-white border-2 border-border flex items-center justify-center ${isAISpeaking ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}`}>
                  <Bot className="w-12 h-12 text-foreground" />
                </div>
                {isAISpeaking && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{AI_TUTOR_CONFIG.assistant.name}</h3>
                <p className="text-sm text-muted-foreground">AI Tutor</p>
                <Badge variant="secondary" className="mt-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Voice Assistant
                </Badge>
              </div>
              {isAISpeaking && (
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-foreground/60 rounded-full"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center mt-8 space-x-4">
            {callStatus === 'idle' && (
              <Button
                onClick={handleStartCall}
                size="lg"
                className='bg-white rounded-xl hover:bg-primary/90 text-black px-8 cursor-pointer'
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Voice Chat
              </Button>
            )}

            {callStatus === 'connecting' && (
              <Button
                disabled
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </Button>
            )}

            {callStatus === 'active' && (
              <>
                <Button
                  onClick={handleToggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>

                <Button
                  onClick={handleToggleSpeaker}
                  variant={isSpeakerOn ? "outline" : "secondary"}
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </Button>

                <Button
                  onClick={() => setShowTranscripts(!showTranscripts)}
                  variant="outline"
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </>
            )}

            {callStatus === 'ended' && (
              <Button
                onClick={handleCallAgain}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Call Again
              </Button>
            )}
          </div>

          {/* Call Status */}
          <div className="text-center mt-6">
            {callStatus === 'idle' && (
              <div className="space-y-2">
                <p className="text-muted-foreground">Ready to start your voice learning session</p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-medium">⏰ Time Limit:</span> Free tier calls are limited to 1.2 minutes (72 seconds) 
                    due to token constraints. Upgrade for unlimited voice sessions.
                  </p>
                </div>
              </div>
            )}
            {callStatus === 'connecting' && (
              <p className="text-muted-foreground">Connecting to AI tutor...</p>
            )}
            {callStatus === 'active' && (
              <p className="text-muted-foreground">
                {isUserSpeaking ? 'You are speaking...' : 
                 isAISpeaking ? 'AI tutor is speaking...' : 
                 'Listening... Speak naturally with your AI tutor'}
              </p>
            )}
            {callStatus === 'ended' && (
              <div className="space-y-2">
                <p className="text-muted-foreground">Call ended. You can start a new session anytime.</p>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    <span className="font-medium">ℹ️ Reminder:</span> Free tier calls are limited to 1.2 minutes. 
                    Consider upgrading for longer, uninterrupted learning sessions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Transcripts */}
          {showTranscripts && transcripts.length > 0 && (
            <div className="mt-8 p-4 bg-muted/20 rounded-lg max-h-64 overflow-y-auto">
              <h4 className="font-semibold mb-3 text-foreground">Conversation Transcript</h4>
              <div className="space-y-2">
                {transcripts.map((transcript, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      transcript.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${
                        transcript.role === 'user' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {transcript.role === 'user' ? user?.name || 'You' : AI_TUTOR_CONFIG.assistant.name}:
                      </span>
                      <p className="text-sm text-foreground mt-1">{transcript.text}</p>
                      <span className="text-xs text-muted-foreground">
                        {transcript.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Status */}
          {/* <div className="mt-6 p-4 bg-muted/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Vapi Public Key: {process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? '✅ Configured' : '❌ Missing'}</p>
                <p>Assistant ID: {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? '✅ Configured' : '❌ Missing'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://vapi.ai', '_blank')}
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Vapi Dashboard
              </Button>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
