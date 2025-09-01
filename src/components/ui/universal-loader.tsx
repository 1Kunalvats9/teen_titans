'use client'

import { useAuth } from '@/hooks/auth'
import HalftoneWaves from '@/components/halftone-waves'

export function UniversalLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <HalftoneWaves />
      </div>
    )
  }

  return <>{children}</>
}
