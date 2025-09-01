'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { useToast } from '../../hooks/use-toast'
import { useSession } from 'next-auth/react'
import { WEBSOCKET_CONFIG } from '@/constants'

interface Message {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommunityChatProps {
  communityId: string
}

export function CommunityChat({ communityId }: CommunityChatProps) {
  const { user } = useAuth()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    fetchMessages()
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [communityId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    console.log('Attempting to connect to WebSocket with communityId:', communityId, 'userId:', user?.id)
    
    // Get session token from NextAuth session or cookies
    const getSessionToken = () => {
      // First try to get from NextAuth session
      if (session?.user) {
        console.log('Using NextAuth session for token');
        return 'session-active'; // We'll use this as a marker
      }
      
      // Fallback to cookies
      const cookies = document.cookie.split(';');
      console.log('All cookies:', cookies);
      
      // Try different session token formats
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('next-auth.session-token='));
      const secureSessionCookie = cookies.find(cookie => cookie.trim().startsWith('__Secure-next-auth.session-token='));
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('next-auth.csrf-token='));
      const secureCsrfCookie = cookies.find(cookie => cookie.trim().startsWith('__Secure-next-auth.csrf-token='));
      
      console.log('Found cookies:', {
        session: sessionCookie,
        secureSession: secureSessionCookie,
        csrf: csrfCookie,
        secureCsrf: secureCsrfCookie
      });
      
      if (sessionCookie) {
        return sessionCookie.split('=')[1];
      } else if (secureSessionCookie) {
        return secureSessionCookie.split('=')[1];
      } else if (csrfCookie) {
        return csrfCookie.split('=')[1];
      } else if (secureCsrfCookie) {
        return secureCsrfCookie.split('=')[1];
      }
      
      return '';
    };
    
    const sessionToken = getSessionToken();
    console.log('Session token found:', sessionToken ? 'Yes' : 'No');
    
    try {
      const baseUrl = WEBSOCKET_CONFIG.getUrl();
      const wsUrl = `${baseUrl}?communityId=${communityId}&userId=${user?.id}`;
      console.log('Connecting to WebSocket URL:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsConnected(true)
        console.log('WebSocket connected successfully')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data.type);
          
          if (data.type === 'message') {
            // Only add message if it's not from the current user (to avoid duplicates)
            setMessages(prev => {
              const messageExists = prev.some(msg => msg.id === data.message.id);
              if (!messageExists) {
                return [...prev, data.message];
              }
              return prev;
            });
          } else if (data.type === 'error') {
            toast({
              title: "Error",
              description: data.message || "Failed to send message",
              variant: "destructive",
            })
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      }
      
      ws.onclose = (event) => {
        setWsConnected(false)
        console.log('WebSocket disconnected:', event.code, event.reason)
        // Reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket()
          }
        }, 3000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        console.error('WebSocket readyState:', ws.readyState)
        console.error('WebSocket URL attempted:', wsUrl)
        console.error('Error details:', {
          type: error.type,
          target: error.target,
          error: error
        })
        
        // Check if it's a connection error
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error('Connection failed - server might not be running or port blocked');
        } else if (ws.readyState === WebSocket.OPEN) {
          console.error('Connection was open but encountered an error');
        } else if (ws.readyState === WebSocket.CLOSING) {
          console.error('Connection is closing');
        } else if (ws.readyState === WebSocket.CLOSED) {
          console.error('Connection is closed');
        }
        
        setWsConnected(false)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setWsConnected(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return
    
    setLoading(true)
    try {
      // First save message to database via API
      const response = await fetch(`/api/communities/${communityId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const messageContent = newMessage.trim()
        setNewMessage('')
        
        // Add message to local state immediately for instant display
        setMessages(prev => [...prev, data.message])
        
        // Then broadcast via WebSocket to other users
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'broadcast',
            message: data.message
          }));
        }
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="w-full h-[90vh] flex flex-col relative">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.author.id === user?.id ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={message.author.image || undefined} />
              <AvatarFallback>
                {message.author.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div
              className={`max-w-[70%] ${
                message.author.id === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              } rounded-lg p-3`}
            >
              <div className="text-sm font-medium mb-1">
                {message.author.name || 'Anonymous'}
              </div>
              <div className="text-sm">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {formatTime(message.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Fixed Input Area at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 shadow-lg z-10">
        <div className="flex gap-3 -mt-4 items-end">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            disabled={loading || !wsConnected}
            className="flex-1 min-h-[50px] py-3 px-4 text-base resize-none"
            style={{ minHeight: '50px', height: 'auto' }}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim() || !wsConnected}
            size="icon"
            className="shrink-0 h-[50px] w-[50px]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        {!wsConnected && (
          <p className="text-xs text-muted-foreground mt-2">
            Connecting to chat...
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-[70px] left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-3 z-10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{wsConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{messages.length} messages</span>
            <span>Community Chat</span>
          </div>
        </div>
      </div>
    </div>
  )
}
