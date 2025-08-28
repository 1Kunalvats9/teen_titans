import { SignupForm } from "@/components/ui/signup-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Signup Form */}
        <div className="bg-card backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Join us and start your learning journey
            </p>
          </div>
          
          <SignupForm />
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-primary hover:text-primary/80 transition-colors duration-200 underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
