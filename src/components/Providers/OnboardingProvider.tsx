'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { OnboardingModal } from '@/components/ui/onboarding-modal'
import { usePathname } from 'next/navigation'

interface OnboardingContextType {
  showOnboarding: () => void
  hideOnboarding: () => void
  isOnboardingOpen: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Only show onboarding modal if:
    // 1. User is authenticated and not loading
    // 2. User is not onboarded
    // 3. We haven't shown it yet for this session
    // 4. User is not on auth pages (login/signup)
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup')
    
    if (
      isAuthenticated && 
      !isLoading && 
      user && 
      !user.isOnboarded && 
      !hasShownOnboarding && 
      !isAuthPage
    ) {
      setIsOnboardingOpen(true)
      setHasShownOnboarding(true)
    }
  }, [user, isAuthenticated, isLoading, hasShownOnboarding, pathname])

  const showOnboarding = () => {
    setIsOnboardingOpen(true)
    setHasShownOnboarding(true)
  }
  
  const hideOnboarding = () => setIsOnboardingOpen(false)

  const value: OnboardingContextType = {
    showOnboarding,
    hideOnboarding,
    isOnboardingOpen,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={hideOnboarding} 
      />
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
