'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Crown, Shield, User, Trash2, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/auth'
import { InviteUsersModal } from './InviteUsersModal'

interface CommunityMember {
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
  }
}

interface CommunityMemberManagementProps {
  communityId: string
  communityName: string
  isPrivate: boolean
  currentUserRole: string
}

export function CommunityMemberManagement({ 
  communityId, 
  communityName, 
  isPrivate, 
  currentUserRole 
}: CommunityMemberManagementProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [loading, setLoading] = useState(true)
  const [managing, setManaging] = useState<string | null>(null)
  const { toast } = useToast()

  const isAdmin = ['ADMIN', 'MODERATOR'].includes(currentUserRole)
  const isSuperAdmin = currentUserRole === 'ADMIN'

  useEffect(() => {
    fetchMembers()
  }, [communityId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members)
      } else {
        throw new Error('Failed to fetch members')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load community members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setManaging(userId)
    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'changeRole',
          targetUserId: userId,
          newRole: newRole
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member role updated successfully",
        })
        fetchMembers() // Refresh the list
      } else {
        throw new Error('Failed to update role')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    } finally {
      setManaging(null)
    }
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the community?`)) {
      return
    }

    setManaging(userId)
    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'removeMember',
          targetUserId: userId
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member removed successfully",
        })
        fetchMembers() // Refresh the list
      } else {
        throw new Error('Failed to remove member')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    } finally {
      setManaging(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'MODERATOR':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'MODERATOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Members ({members.length})</h2>
          <p className="text-muted-foreground">
            Manage community members and their roles
          </p>
        </div>
        
        <InviteUsersModal
          communityId={communityId}
          communityName={communityName}
          isPrivate={isPrivate}
          trigger={
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4" />
              Invite Members
            </Button>
          }
        />
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.user.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback>
                      {member.user.name?.[0] || member.user.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.user.name || 'No name'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  <Badge className={`${getRoleColor(member.role)} flex items-center gap-1`}>
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>

                  {/* Role Management (Admin Only) */}
                  {isAdmin && member.user.id !== user?.id && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => handleRoleChange(member.user.id, newRole)}
                        disabled={managing === member.user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {isSuperAdmin && (
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          )}
                          <SelectItem value="MODERATOR">Moderator</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Remove Member Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user.id, member.user.name || member.user.email)}
                        disabled={managing === member.user.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {managing === member.user.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No members found in this community.</p>
        </div>
      )}
    </div>
  )
}
