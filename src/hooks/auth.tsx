'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useRouter } from 'next/navigation'

type Persona = 'Einstein' | 'Steve Jobs' | 'Casual Friend' | null

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  emailVerified?: Date | null
  isOnboarded?: boolean
  persona?: Persona | string | null
  onboardingStep?: number
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  loginGoogle: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  completeOnboarding: (payload: { persona?: Persona | string; imageUrl?: string }) => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const s = session as Session | null
    if (s?.user) {
      setUser({
        id: s.user.id,
        name: s.user.name,
        email: s.user.email,
        image: s.user.image,
        emailVerified: s.user.emailVerified ?? null,
        isOnboarded: (s.user as unknown as { isOnboarded?: boolean })?.isOnboarded ?? false,
        persona: (s.user as unknown as { persona?: string | null })?.persona ?? null,
        onboardingStep: (s.user as unknown as { onboardingStep?: number })?.onboardingStep ?? 0,
      })
    } else {
      setUser(null)
    }
  }, [session])

  const isAuthenticated = !!user
  const isLoading = status === 'loading'

  const login = useCallback(async (email: string, password: string) => {
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) return { success: false, message: 'Invalid email or password' }
    await update()
    return { success: true }
  }, [update])

  const loginGoogle = useCallback(async () => {
    await signIn('google')
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { success: false, message: data.error || 'Signup failed' }
    }
    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }, [])

  const checkAuth = useCallback(async () => {
    await update()
  }, [update])

  const completeOnboarding = useCallback(async (payload: { persona?: Persona | string; imageUrl?: string }) => {
    try {
      const res = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { success: false, message: data.error || 'Failed to complete onboarding' }
      }
      
      // Update the session to reflect onboarding completion
      await update()
      
      // Redirect to dashboard after successful onboarding
      router.push('/dashboard')
      return { success: true }
    } catch (e) {
      return { success: false, message: 'Failed to complete onboarding' }
    }
  }, [router, update])

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    loginGoogle,
    register,
    logout,
    checkAuth,
    completeOnboarding,
  }), [user, isAuthenticated, isLoading, login, loginGoogle, register, logout, checkAuth, completeOnboarding])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AppAuthProvider')
  return ctx
}


