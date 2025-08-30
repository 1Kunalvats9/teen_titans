'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const { user, completeOnboarding, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [persona, setPersona] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.isOnboarded) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!persona) {
      toast.error('Please select a learning persona')
      return
    }

    setLoading(true)
    try {
      const result = await completeOnboarding({ persona, imageUrl })
      if (result.success) {
        toast.success('Onboarding completed!')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Teen Titans!</CardTitle>
          <CardDescription>
            Let's personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="persona">Choose your learning persona</Label>
              <div className="grid gap-3">
                {[
                  { value: 'Einstein', description: 'Deep analytical learning' },
                  { value: 'Steve Jobs', description: 'Creative problem solving' },
                  { value: 'Casual Friend', description: 'Relaxed and friendly approach' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={persona === option.value ? 'default' : 'outline'}
                    className="justify-start h-auto p-4"
                    onClick={() => setPersona(option.value)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{option.value}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Profile Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !persona}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Onboarding'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
