'use client'

import React, { useState } from 'react'
import { Button } from './button'
import { FileInput } from './file-input'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'

const PERSONAS = [
  {
    id: 'Einstein',
    name: 'Einstein',
    description: 'Analytical and methodical. Explains complex concepts step-by-step with detailed reasoning and scientific precision.',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'Steve Jobs',
    name: 'Steve Jobs',
    description: 'Visionary and inspiring. Focuses on the big picture, practical applications, and making learning exciting and relevant.',
    icon: '💡',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'Casual Friend',
    name: 'Casual Friend',
    description: 'Warm and approachable. Uses everyday examples, humor, and conversational language to make learning feel natural.',
    icon: '😊',
    color: 'from-green-500 to-emerald-500'
  }
] as const

type Persona = typeof PERSONAS[number]['id']

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { completeOnboarding } = useAuth()
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState<Persona | ''>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  React.useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }, [selectedFile])

  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      // Complete onboarding with no persona or image
      const result = await completeOnboarding({})
      
      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Skipping onboarding failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = async () => {
    if (!selectedPersona) return

    setIsSubmitting(true)
    try {
      let uploadedUrl: string | undefined
      
      if (selectedFile) {
        // Convert file to base64 for upload
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(selectedFile)
        })

        const res = await fetch('/api/user/profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64 })
        })
        
        if (res.ok) {
          const data = await res.json()
          uploadedUrl = data.user?.image
        }
      }

      const result = await completeOnboarding({ 
        persona: selectedPersona, 
        imageUrl: uploadedUrl 
      })

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome! Let&apos;s personalize your experience
              </h2>
              <p className="text-muted-foreground mt-1">
                Choose your tutor persona and upload a profile picture
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Persona Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Choose Your Tutor Persona
              </h3>
              <p className="text-sm text-muted-foreground">
                Select the personality that best matches your learning style
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    selectedPersona === persona.id
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${persona.icon}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground mb-1">
                        {persona.name}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {persona.description}
                      </div>
                    </div>
                  </div>
                  
                  {selectedPersona === persona.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Image Upload */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Profile Picture
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload a photo to personalize your profile (optional)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput
                label="Upload Image"
                description="Drag and drop or click to browse"
                accept="image/*"
                onFileSelect={setSelectedFile}
              />
              
              {imagePreview && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Preview
                  </label>
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-border"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setImagePreview('')
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!selectedPersona || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Setting up...</span>
                </div>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}