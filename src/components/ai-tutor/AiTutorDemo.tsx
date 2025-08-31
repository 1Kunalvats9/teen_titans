"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Sparkles,
  User,
  Bot,
  RotateCcw
} from "lucide-react"

export function AiTutorDemo() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const durationRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Start call timer
  useEffect(() => {
    if (callStatus === 'active') {
      durationRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
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
    try {
      setCallStatus('connecting')
      
      // Simulate connection delay
      setTimeout(() => {
        setCallStatus('active')
        // Simulate AI speaking after connection
        setTimeout(() => {
          setIsAISpeaking(true)
          setTimeout(() => setIsAISpeaking(false), 3000)
        }, 1000)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to start call:', error)
      setCallStatus('idle')
    }
  }

  const handleEndCall = async () => {
    try {
      setCallStatus('ended')
    } catch (error) {
      console.error('Failed to end call:', error)
    }
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  // Simulate user speaking randomly
  useEffect(() => {
    if (callStatus === 'active') {
      const userSpeakingTimer = setInterval(() => {
        if (Math.random() > 0.7) {
          setIsUserSpeaking(true)
          setTimeout(() => setIsUserSpeaking(false), 2000)
        }
      }, 5000)

      return () => clearInterval(userSpeakingTimer)
    }
  }, [callStatus])

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      {/* Call Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">AI Tutor Demo Call</h2>
          <p className="text-muted-foreground">Learning about: JavaScript Fundamentals</p>
          {callStatus === 'active' && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Connected</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{formatDuration(callDuration)}</span>
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
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ${isUserSpeaking ? 'ring-4 ring-blue-400 ring-opacity-50 animate-pulse' : ''}`}>
                  <User className="w-12 h-12 text-white" />
                </div>
                {isUserSpeaking && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Mic className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Demo User</h3>
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
              {isUserSpeaking && (
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Side */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center ${isAISpeaking ? 'ring-4 ring-purple-400 ring-opacity-50 animate-pulse' : ''}`}>
                  <Bot className="w-12 h-12 text-white" />
                </div>
                {isAISpeaking && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Alisha</h3>
                <p className="text-sm text-muted-foreground">AI Tutor</p>
                <Badge variant="secondary" className="mt-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Demo Mode
                </Badge>
              </div>
              {isAISpeaking && (
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-purple-400 rounded-full animate-pulse"
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
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Phone className="w-5 h-5 mr-2" />
                Start Demo Call
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
              </>
            )}

            {callStatus === 'ended' && (
              <Button
                onClick={handleStartCall}
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
              <p className="text-muted-foreground">Ready to start your demo learning session</p>
            )}
            {callStatus === 'connecting' && (
              <p className="text-muted-foreground">Connecting to AI tutor...</p>
            )}
            {callStatus === 'active' && (
              <p className="text-muted-foreground">
                {isUserSpeaking ? 'You are speaking...' : 
                 isAISpeaking ? 'AI tutor is speaking...' : 
                 'Listening... This is a demo simulation'}
              </p>
            )}
            {callStatus === 'ended' && (
              <p className="text-muted-foreground">Demo call ended. Try the full version for real conversations!</p>
            )}
          </div>

          {/* Demo Info */}
          <div className="text-center mt-6 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Mode:</strong> This simulates the call interface. In the full version, you'll have real voice conversations with Alisha using VAPI and ElevenLabs voice synthesis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
