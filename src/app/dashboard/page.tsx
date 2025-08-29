'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace('/login')
  }, [user, isLoading, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome, {user.name || user.email}</p>
      {user.persona && (
        <div className="mt-4 p-4 bg-card border border-border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Your Tutor Persona</h2>
          <p className="text-muted-foreground">{user.persona}</p>
        </div>
      )}
    </div>
  )
}


