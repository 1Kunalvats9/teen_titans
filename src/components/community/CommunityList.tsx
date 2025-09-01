'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Users, MessageCircle, Calendar, Plus, Lock, Globe, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { useToast } from '../../hooks/use-toast'
import { InviteUsersModal } from './InviteUsersModal'

interface Community {
  id: string
  name: string
  description: string | null
  isActive: boolean
  isPrivate: boolean
  createdAt: string
  _count: {
    members: number
    messages: number
  }
  members: Array<{
    userId: string
    role: string
  }>
}

export function CommunityList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    isPrivate: false
  })

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities')
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities)
      } else {
        throw new Error('Failed to fetch communities')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const joinCommunity = async (communityId: string) => {
    if (!user) return
    
    setJoining(communityId)
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "You have joined the community!",
        })
        // Refresh communities to update member count
        fetchCommunities()
      } else {
        throw new Error('Failed to join community')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive",
      })
    } finally {
      setJoining(null)
    }
  }

  const createCommunity = async () => {
    if (!user || !newCommunity.name.trim()) return
    
    setCreating(true)
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommunity),
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Community created successfully!",
        })
        setNewCommunity({ name: '', description: '', isPrivate: false })
        setShowCreateDialog(false)
        fetchCommunities()
      } else {
        throw new Error('Failed to create community')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const isMember = (community: Community) => {
    return community.members.some(member => member.userId === user?.id)
  }

  const isAdmin = (community: Community) => {
    return community.members.some(member => 
      member.userId === user?.id && ['ADMIN', 'MODERATOR'].includes(member.role)
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Community Button */}
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>Start a new community for like-minded learners</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="community-name">Community Name</Label>
                <Input
                  id="community-name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter community name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="community-description">Description (Optional)</Label>
                <Input
                  id="community-description"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your community"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-private"
                  checked={newCommunity.isPrivate}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is-private" className="text-sm">
                  Make this a private community (invite-only)
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={createCommunity}
                  disabled={creating || !newCommunity.name.trim()}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create Community'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {community.name}
                    {!community.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {community.isPrivate ? (
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
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {community.description || 'No description available'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{community._count.members}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{community._count.messages}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isMember(community) ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        console.log('Navigating to community:', community.id)
                        router.push(`/community/${community.id}`)
                      }}
                    >
                      View Community
                    </Button>
                    {isMember(community) && (
                      <InviteUsersModal
                        communityId={community.id}
                        communityName={community.name}
                        isPrivate={community.isPrivate}
                        trigger={
                          <Button variant="outline" size="sm" className="px-3 bg-primary text-white hover:bg-primary/90">
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}
                  </>
                ) : (
                  <Button 
                    className="flex-1"
                    onClick={() => joinCommunity(community.id)}
                    disabled={joining === community.id}
                  >
                    {joining === community.id ? 'Joining...' : 'Join Community'}
                  </Button>
                )}
              </div>
              
              {/* Debug info for members */}
              {isMember(community) && (
                <div className="text-xs text-muted-foreground mt-2">
                  Debug: You are {community.members.find(m => m.userId === user?.id)?.role} of this community
                </div>
              )}
              
              {/* Member Management Section for Members */}
              {isMember(community) && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Community Actions</span>
                    <span className="text-xs">{community._count.members} members</span>
                  </div>
                  <div className="flex gap-2">
                    <InviteUsersModal
                      communityId={community.id}
                      communityName={community.name}
                      isPrivate={community.isPrivate}
                      trigger={
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Invite Members
                        </Button>
                      }
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => router.push(`/community/${community.id}/manage`)}
                    >
                      Manage Members
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {communities.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            No communities available at the moment.
          </div>
          <p className="text-sm text-muted-foreground">
            Check back later for new communities!
          </p>
        </div>
      )}


    </div>
  )
}
