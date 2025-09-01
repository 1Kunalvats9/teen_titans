'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CommunityMemberManagement } from '@/components/community/CommunityMemberManagement'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Community {
  id: string
  name: string
  description: string | null
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

export default function CommunityManagePage({ params }: { params: Promise<{ communityId: string }> }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
      return
    }

    if (user) {
      fetchCommunity()
    }
  }, [user, isLoading, router, resolvedParams.communityId])

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${resolvedParams.communityId}`)
      if (response.ok) {
        const data = await response.json()
        setCommunity(data.community)
        
        // Find current user's role
        const membership = data.community.members.find(
          (member: any) => member.userId === user?.id
        )
        setCurrentUserRole(membership?.role || '')
      } else {
        throw new Error('Failed to fetch community')
      }
    } catch (error) {
      console.error('Error fetching community:', error)
      router.push('/community')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user || !community) {
    return null
  }

  // Check if user is a member of the community
  const isMember = community.members.some((member: any) => member.userId === user?.id)
  
  if (!isMember) {
    router.push(`/community/${resolvedParams.communityId}`)
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/community/${resolvedParams.communityId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Community
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Manage {community.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Manage community members, roles, and settings
          </p>
        </div>

        {/* Community Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Community Overview
            </CardTitle>
            <CardDescription>
              Basic information about your community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{community._count.members}</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{community._count.messages}</div>
                <div className="text-sm text-muted-foreground">Total Messages</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {community.isPrivate ? 'Private' : 'Public'}
                </div>
                <div className="text-sm text-muted-foreground">Community Type</div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium">Created:</span> {new Date(community.createdAt).toLocaleDateString()}
              </div>
              {community.description && (
                <div className="text-sm mt-1">
                  <span className="font-medium">Description:</span> {community.description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Management */}
        <CommunityMemberManagement
          communityId={resolvedParams.communityId}
          communityName={community.name}
          isPrivate={community.isPrivate}
          currentUserRole={currentUserRole}
        />
      </div>
    </div>
  )
}
