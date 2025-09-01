'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Check, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  isMember: boolean
  hasPendingInvite: boolean
}

interface InviteUsersModalProps {
  communityId: string
  communityName: string
  isPrivate: boolean
  trigger?: React.ReactNode
}

export function InviteUsersModal({ communityId, communityName, isPrivate, trigger }: InviteUsersModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const { toast } = useToast()

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return

    setSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}&communityId=${communityId}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users)
      } else {
        throw new Error('Failed to search users')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const sendInvite = async (userEmail: string) => {
    setSendingInvite(userEmail)
    try {
      const response = await fetch(`/api/communities/${communityId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteeEmail: userEmail }),
      })

      if (response.ok) {
        toast({
          title: "Invite Sent",
          description: "Invitation has been sent successfully",
        })
        
        // Update the search results to show the invite was sent
        setSearchResults(prev => 
          prev.map(user => 
            user.email === userEmail 
              ? { ...user, hasPendingInvite: true }
              : user
          )
        )
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invite')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invite",
        variant: "destructive",
      })
    } finally {
      setSendingInvite(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchUsers()
  }

  const resetSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Users
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Users to {communityName}</DialogTitle>
          <DialogDescription>
            Search for users by name or email to invite them to this private community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search users
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={searching || searchQuery.trim().length < 2}
              size="sm"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Search Results</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetSearch}
                  className="h-auto p-1 text-xs"
                >
                  Clear
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {user.name?.[0] || user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {user.isMember ? (
                        <Badge variant="secondary" className="text-xs">
                          Already Member
                        </Badge>
                      ) : user.hasPendingInvite ? (
                        <Badge variant="outline" className="text-xs">
                          Invite Sent
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendInvite(user.email)}
                          disabled={sendingInvite === user.email}
                          className="h-7 px-2 text-xs"
                        >
                          {sendingInvite === user.email ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
