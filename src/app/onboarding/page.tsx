'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import HalftoneWaves from '@/components/halftone-waves'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function OnboardingPage() {
  const { user, completeOnboarding, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [persona, setPersona] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Please select a valid image file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: base64 }),
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const result = await response.json()
      if (result.success) {
        return result.data.imageUrl
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload image to Cloudinary')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!persona) {
      toast.error('Please select a learning persona')
      return
    }

    setLoading(true)
    setUploading(true)
    
    try {
      let imageUrl = ''
      
      // Upload image if selected
      if (selectedFile) {
        try {
          imageUrl = await uploadToCloudinary(selectedFile)
          toast.success('Profile image uploaded successfully!')
        } catch (error) {
          toast.error('Failed to upload image. Please try again.')
          setLoading(false)
          setUploading(false)
          return
        }
      }

      // Complete onboarding
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
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HalftoneWaves />
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
              <Label>Profile Image (optional)</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  previewUrl ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={previewUrl} alt="Preview" />
                        <AvatarFallback className="text-2xl">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop an image here, or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(file)
                  }
                }}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !persona}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading...' : 'Completing...'}
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
