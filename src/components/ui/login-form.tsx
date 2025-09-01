"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, loginGoogle, isLoading, user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Redirect to dashboard when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, redirecting to dashboard...')
      // Always redirect to dashboard - OnboardingProvider will show modal if needed
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    
    if (!email || !password) return
    
    setLoading(true)
    try {
      const res = await login(email, password)
      if (!res.success) {
        setError(res.message || 'Invalid email or password')
      }
      // The useEffect above will handle the redirect
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginGoogle()
      // Google login will redirect automatically
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-6">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary hover:text-primary/80"
              >
                Forgot your password?
              </a>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading || isLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={loading || isLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login with Google'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
