'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CommunityChat } from '../../../components/community/CommunityChat'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'


interface CommunityPageProps {
  params: {
    communityId: string
  }
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [community, setCommunity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [communityId, setCommunityId] = useState<string | null>(null)

  useEffect(() => {
    console.log('Auth state:', { user, isLoading })
    // Only redirect if we're sure there's no user and not loading
    if (!isLoading && !user) {
      console.log('Redirecting to login - no user found')
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Debug: Log when component mounts and when user/auth state changes
  useEffect(() => {
    console.log('CommunityPage auth effect - user:', user?.id, 'isLoading:', isLoading)
  }, [user, isLoading])

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('CommunityPage mounted with params:', params)
  }, [params])

  useEffect(() => {
    // Handle async params
    const getCommunityId = async () => {
      try {
        const resolvedParams = await params
        console.log('Resolved params:', resolvedParams)
        setCommunityId(resolvedParams.communityId)
      } catch (error) {
        console.error('Error resolving params:', error)
      }
    }
    getCommunityId()
  }, [params])

  useEffect(() => {
    if (user && communityId) {
      fetchCommunity()
    }
  }, [user, communityId])

  const fetchCommunity = async () => {
    if (!communityId) return
    
    console.log('Fetching community:', communityId)
    try {
      const response = await fetch(`/api/communities/${communityId}`)
      console.log('Community response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Community data:', data)
        setCommunity(data.community)
      } else {
        const errorData = await response.json()
        console.error('Community error:', errorData)
        setError('Community not found')
      }
    } catch (error) {
      console.error('Fetch community error:', error)
      setError('Failed to load community')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading community..." />
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!isLoading && !user) return null

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">{error}</div>
          <Button onClick={() => router.push('/community')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.02),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.02),transparent_50%)]" />
      </div>



      {/* Chat Area - Full Height */}
      <div className="flex-1 relative">
        {communityId && <CommunityChat communityId={communityId} />}
      </div>
    </div>
  )
}
