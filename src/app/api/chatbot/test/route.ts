import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
      GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    }

    // Test Gemini API
    let geminiTest = 'Not tested'
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
        const result = await model.generateContent('Hello, this is a test.')
        geminiTest = 'Success: ' + result.response.text().substring(0, 50) + '...'
      } catch (error) {
        geminiTest = 'Error: ' + (error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Test Vision API credentials
    let visionTest = 'Not tested'
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        visionTest = 'Credentials parsed successfully'
      } catch (error) {
        visionTest = 'Error parsing credentials: ' + (error instanceof Error ? error.message : 'Unknown error')
      }
    }

    return NextResponse.json({
      status: 'success',
      environment: envCheck,
      geminiTest,
      visionTest,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to test APIs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
