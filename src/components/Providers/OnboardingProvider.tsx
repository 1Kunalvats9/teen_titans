'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { OnboardingModal } from '@/components/ui/onboarding-modal'
import { usePathname } from 'next/navigation'
import { useUserStatus } from '@/hooks/queries/use-user-status'

interface OnboardingContextType {
  showOnboarding: () => void
  hideOnboarding: () => void
  isOnboardingOpen: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { data: userStatus, isLoading: statusLoading } = useUserStatus(isAuthenticated && !isLoading)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Only show onboarding modal if:
    // 1. User is authenticated and not loading
    // 2. User is not onboarded (from database)
    // 3. We haven't shown it yet for this session
    // 4. User is not on auth pages (login/signup)
    // 5. Status is not loading
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup')
    
    if (isLoading || statusLoading || !isAuthenticated || isAuthPage) return
    
    if (userStatus && !userStatus.isOnboarded && !hasShownOnboarding) {
      setIsOnboardingOpen(true)
      setHasShownOnboarding(true)
    }
  }, [userStatus, isAuthenticated, isLoading, statusLoading, hasShownOnboarding, pathname])

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
