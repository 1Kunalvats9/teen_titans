'use client'

import { usePathname } from 'next/navigation'

interface ConditionalPaddingProps {
  children: React.ReactNode
}

export function ConditionalPadding({ children }: ConditionalPaddingProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  
  return (
    <main className={`flex-1 ${!isHomePage ? 'pt-20' : ''}`}>
      {children}
    </main>
  )
}
