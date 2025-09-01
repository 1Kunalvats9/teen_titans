'use client'

import { useState } from 'react'
import { VapiVoiceWidget } from '@/components/ai-tutor/VapiVoiceWidget'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Settings, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TestVapiPage() {
  const router = useRouter()
  const [showWidget, setShowWidget] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Vapi Integration Test</h1>
          <Button
            variant="outline"
            onClick={() => window.open('https://vapi.ai', '_blank')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Vapi Dashboard</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Configuration Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Vapi Public Key</span>
                <Badge variant={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? '✅ Configured' : '❌ Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Assistant ID</span>
                <Badge variant={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? '✅ Configured' : '❌ Missing'}
                </Badge>
              </div>
            </div>
            
            {(!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || !process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Configuration Required</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Please configure your Vapi credentials in your <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file.
                </p>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><code>NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_your_key_here</code></p>
                  <p><code>NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here</code></p>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  See <code className="bg-yellow-100 px-2 py-1 rounded">VAPI_SETUP.md</code> for detailed setup instructions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowWidget(!showWidget)}
                variant={showWidget ? "outline" : "default"}
                size="lg"
              >
                {showWidget ? 'Hide' : 'Show'} Voice Widget
              </Button>
              {showWidget && (
                <Button
                  onClick={() => setShowWidget(false)}
                  variant="outline"
                  size="lg"
                >
                  Reset Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice Widget */}
        {showWidget && (
          <Card>
            <CardHeader>
              <CardTitle>Voice Widget Test</CardTitle>
            </CardHeader>
            <CardContent>
              <VapiVoiceWidget
                onEndCall={() => setShowWidget(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!showWidget && (
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Ensure your Vapi credentials are configured in <code>.env.local</code></li>
                  <li>Click "Show Voice Widget" to display the voice interface</li>
                  <li>Allow microphone access when prompted by your browser</li>
                  <li>Click "Start Voice Chat" to begin a conversation</li>
                  <li>Speak naturally with your AI tutor</li>
                  <li>Test mute/unmute and other controls</li>
                  <li>Check the conversation transcript</li>
                  <li>End the call when finished testing</li>
                </ol>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Expected Behavior</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Voice widget should initialize without errors</li>
                  <li>Microphone permission should be requested</li>
                  <li>Call should connect to your Vapi assistant</li>
                  <li>Real-time transcription should work</li>
                  <li>Voice controls should be responsive</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
