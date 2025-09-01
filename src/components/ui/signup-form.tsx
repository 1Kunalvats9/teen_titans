'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { register: registerUser, loginGoogle, isLoading } = useAuth()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '')
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    if (!name || !email || !password) return

    try {
      setLoading(true)
      const res = await registerUser(name, email, password)
      if (!res.success) {
        setError(res.message || 'Signup failed')
        return
      }
      // Show success message with email verification info and redirect to login
      toast.success('Account created successfully! Please check your email for verification link.', {
        duration: 6000,
        description: 'You can now log in after verifying your email address.'
      })
      router.push('/login')
    } catch (error) {
      console.error('Signup error:', error)
      setError('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      await loginGoogle()
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
            <Label htmlFor="name">Full name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Name" 
              required 
              disabled={loading}
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              placeholder="Password" 
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
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              type="button" 
              onClick={handleGoogleSignup}
              disabled={loading || isLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                'Sign up with Google'
              )}
            </Button>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors duration-200 underline">
            Sign in to LearnOS
          </Link>
        </div>
      </form>
    </div>
  )
}
