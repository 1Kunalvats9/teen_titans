'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Users, Lock, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CommunityInvite {
  id: string
  status: string
  createdAt: string
  expiresAt: string
  community: {
    id: string
    name: string
    description: string | null
    isPrivate: boolean
  }
  inviter: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export function CommunityInviteNotification() {
  const [invites, setInvites] = useState<CommunityInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/communities/invites')
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
      } else {
        throw new Error('Failed to fetch invites')
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteAction = async (inviteId: string, action: 'accept' | 'reject') => {
    setProcessing(inviteId)
    try {
      const response = await fetch(`/api/communities/invites/${inviteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: action === 'accept' ? 'Invite Accepted' : 'Invite Rejected',
          description: action === 'accept' 
            ? 'You have joined the community!' 
            : 'Invite has been rejected',
        })
        
        // Remove the processed invite from the list
        setInvites(prev => prev.filter(invite => invite.id !== inviteId))
        
        if (action === 'accept') {
          // Navigate to the community after a short delay
          setTimeout(() => {
            const invite = invites.find(i => i.id === inviteId)
            if (invite) {
              router.push(`/community/${invite.community.id}`)
            }
          }, 1000)
        }
      } else {
        throw new Error('Failed to process invite')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process invite",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const deleteInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/communities/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInvites(prev => prev.filter(invite => invite.id !== inviteId))
        toast({
          title: "Invite Removed",
          description: "Invite has been removed from your list",
        })
      } else {
        throw new Error('Failed to delete invite')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove invite",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </CardContent>
      </Card>
    )
  }

  if (invites.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20 bg-primary/5 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary" />
          Community Invites ({invites.length})
        </CardTitle>
        <CardDescription>
          You have pending invitations to join communities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map((invite) => {
          const isExpired = new Date(invite.expiresAt) < new Date()
          const daysLeft = Math.ceil((new Date(invite.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          
          return (
            <div key={invite.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={invite.inviter.image || undefined} />
                    <AvatarFallback>
                      {invite.inviter.name?.[0] || invite.inviter.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {invite.inviter.name || invite.inviter.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      invited you to join
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invite.community.isPrivate ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Public
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="font-semibold text-lg mb-1">
                  {invite.community.name}
                </div>
                {invite.community.description && (
                  <div className="text-sm text-muted-foreground">
                    {invite.community.description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {isExpired ? (
                    <span className="text-destructive">Invite expired</span>
                  ) : (
                    <span>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                  )}
                </div>
                
                {!isExpired && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInviteAction(invite.id, 'reject')}
                      disabled={processing === invite.id}
                      variant="outline"
                    >
                      {processing === invite.id ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleInviteAction(invite.id, 'accept')}
                      disabled={processing === invite.id}
                    >
                      {processing === invite.id ? 'Processing...' : 'Accept'}
                    </Button>
                  </div>
                )}
                
                {isExpired && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteInvite(invite.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
    </motion.div>
  )
}
