'use client'

import { useSession } from 'next-auth/react'
import { useRef, useEffect, useState, useCallback } from 'react'
import type { Session } from 'next-auth'

export function useStableSession() {
  const { data: session, status, update } = useSession()
  const [stableSession, setStableSession] = useState<Session | null>(null)
  const lastSessionRef = useRef<string | null>(null)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (session) {
      // Create a stable reference by comparing session data
      const sessionKey = JSON.stringify({
        id: (session.user as { id?: string })?.id,
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
        emailVerified: (session.user as { emailVerified?: Date | null })?.emailVerified,
        isOnboarded: (session.user as { isOnboarded?: boolean })?.isOnboarded,
        persona: (session.user as { persona?: string | null })?.persona,
        xp: (session.user as { xp?: number })?.xp,
        streak: (session.user as { streak?: number })?.streak,
      })

      if (lastSessionRef.current !== sessionKey) {
        lastSessionRef.current = sessionKey
        setStableSession(session as unknown as Session)
      }
    } else {
      if (lastSessionRef.current !== null) {
        lastSessionRef.current = null
        setStableSession(null)
      }
    }
  }, [session])

  // Debounced update function to prevent excessive session updates
  const debouncedUpdate = useCallback(async () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    updateTimeoutRef.current = setTimeout(async () => {
      await update()
    }, 1000) // Debounce for 1 second
  }, [update])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  return {
    data: stableSession,
    status,
    update: debouncedUpdate
  }
}
