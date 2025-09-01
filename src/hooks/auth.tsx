'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useRouter, usePathname } from 'next/navigation'
import { apiService } from '@/lib/services/api.service'
import { toast } from 'sonner'

type Persona = 'Einstein' | 'Steve Jobs' | 'Casual Friend' | null

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  emailVerified?: Date | null
  isOnboarded?: boolean
  persona?: Persona | string | null
  xp?: number
  streak?: number
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  loginGoogle: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  completeOnboarding: (payload: { persona?: Persona | string; imageUrl?: string }) => Promise<{ success: boolean; message?: string }>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is onboarded
  const checkOnboardingStatus = useCallback(async (userId: string) => {
    try {
      const userStatus = await apiService.user.getStatus()
      return userStatus.isOnboarded
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      return false
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (status === 'loading') return

        if (session?.user) {
          const sessionUser = session.user as any
          console.log('Session user data:', sessionUser)
          const newUser = {
            id: sessionUser.id || '',
            name: sessionUser.name,
            email: sessionUser.email,
            image: sessionUser.image,
            emailVerified: sessionUser.emailVerified ?? null,
            isOnboarded: sessionUser.isOnboarded ?? false,
            persona: sessionUser.persona ?? null,
            xp: sessionUser.xp ?? 0,
            streak: sessionUser.streak ?? 0,
          }
          
          console.log('Setting user state to:', newUser)
          setUser(newUser)

          // Check if user is onboarded
          const isOnboarded = await checkOnboardingStatus(newUser.id)
          console.log('Auth hook - user onboarded:', isOnboarded, 'pathname:', pathname)
          
          // Only redirect if user is not onboarded and not already on onboarding page
          if (!isOnboarded) {
            console.log('User not onboarded - OnboardingProvider will show modal')
            // No need to redirect since OnboardingProvider will show the modal
          }
        } else {
          setUser(null)
          // Only redirect to login if not on public pages and not already on login page
          const publicPages = ['/', '/login', '/signup', '/verify-request']
          const isPublicPage = publicPages.some(page => pathname.startsWith(page))
          console.log('Auth hook - no user, pathname:', pathname, 'isPublicPage:', isPublicPage)
          
          if (!isPublicPage && !pathname.includes('/login')) {
            console.log('Redirecting to login - not a public page')
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [session, status, pathname, router, checkOnboardingStatus])

  const isAuthenticated = !!user
  const isLoading = status === 'loading' || !isInitialized

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await signIn('credentials', { redirect: false, email, password })
      if (res?.error) {
        return { success: false, message: 'Invalid email or password' }
      }
      await update()
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  }, [update])

  const loginGoogle = useCallback(async () => {
    try {
      await signIn('google')
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Google login failed')
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const result = await apiService.auth.signup({ name, email, password })
      if (!result.success) {
        return { success: false, message: result.error }
      }
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Registration failed' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      await update()
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }, [update])

  const refreshUserData = useCallback(async () => {
    try {
      console.log('Refreshing user data...')
      // Force a complete session refresh to get the latest user data
      await update()
      console.log('First update completed')
      
      // Also trigger a router refresh to ensure all components get the latest data
      router.refresh()
      console.log('Router refresh triggered')
      
      // Add a small delay to ensure the session update has propagated
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log('Delay completed')
      
      // Force another update to ensure we have the latest data
      await update()
      console.log('Second update completed')
    } catch (error) {
      console.error('Refresh user data error:', error)
    }
  }, [update, router])

  const completeOnboarding = useCallback(async (payload: { persona?: Persona | string; imageUrl?: string }) => {
    try {
      console.log('Starting onboarding completion with payload:', payload)
      const cleanPayload = {
        persona: payload.persona || undefined,
        imageUrl: payload.imageUrl
      }
      const result = await apiService.auth.completeOnboarding(cleanPayload)
      if (result.success) {
        console.log('Onboarding API call successful, refreshing user data...')
        // Refresh user data and wait for it to complete
        await refreshUserData()
        
        console.log('User data refreshed, waiting for session update...')
        // Add a small delay to ensure the session is fully updated
        await new Promise(resolve => setTimeout(resolve, 200))
        
        console.log('Redirecting to dashboard...')
        router.push('/dashboard')
        return { success: true }
      } else {
        return { success: false, message: result.error }
      }
    } catch (error) {
      console.error('Complete onboarding error:', error)
      return { success: false, message: 'Failed to complete onboarding' }
    }
  }, [router, refreshUserData])

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    loginGoogle,
    register,
    logout,
    checkAuth,
    completeOnboarding,
    refreshUserData,
  }), [user, isAuthenticated, isLoading, isInitialized, login, loginGoogle, register, logout, checkAuth, completeOnboarding, refreshUserData])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AppAuthProvider')
  return ctx
}



