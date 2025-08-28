import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-card backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Mail className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Check your email
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We've sent you a verification link to your email address. 
              Click the link to verify your account and get started.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-primary rounded-full flex-shrink-0 mt-0.5"></div>
              <div className="text-sm text-accent-foreground">
                <p className="font-medium">Verification link expires in 1 hour</p>
                <p className="text-muted-foreground mt-1">Check your spam folder if you don't see it</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/login"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </Link>
            
            <Link 
              href="/"
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 px-6 rounded-xl transition-all duration-300 border border-border flex items-center justify-center"
            >
              Go to Homepage
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Didn't receive the email?{' '}
              <button className="text-primary hover:text-primary/80 transition-colors duration-200 underline">
                Resend verification
              </button>
            </p>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
