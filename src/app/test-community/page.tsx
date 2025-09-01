'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import HalftoneWaves from '@/components/halftone-waves'

export default function TestCommunityPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      user: user ? { id: user.id, name: user.name, isOnboarded: user.isOnboarded } : null,
      isLoading,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }, [user, isLoading])

  const testCommunityNavigation = () => {
    console.log('Testing community navigation...')
    router.push('/community/test-community-id')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HalftoneWaves />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Community Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <Button onClick={testCommunityNavigation}>
          Test Community Navigation
        </Button>
        
        <Button onClick={() => router.push('/community')}>
          Go to Community List
        </Button>
        
        <Button onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
