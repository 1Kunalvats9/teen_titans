'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'

interface BackButtonProps {
  href?: string
  className?: string
  children?: React.ReactNode
}

export function BackButton({ href, className = '', children }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`hover:bg-background/50 cursor-pointer ${className}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {children || 'Back'}
    </Button>
  )
}
