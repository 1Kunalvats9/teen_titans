'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { OnboardingModal } from '@/components/ui/onboarding-modal'

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

  useEffect(() => {
    // Show onboarding modal if user is authenticated but not onboarded
    // and we haven't shown it yet for this session
    if (isAuthenticated && !isLoading && user && !user.isOnboarded && !hasShownOnboarding) {
      setIsOnboardingOpen(true)
      setHasShownOnboarding(true)
    }
  }, [user, isAuthenticated, isLoading, hasShownOnboarding])

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
