import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import path from 'path'
import fs from 'fs'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Initialize Google Vision API with proper credentials (similar to ApniDukan)
let visionClient: ImageAnnotatorClient

try {
  // Try to use credentials file first (recommended approach)
  const credentialsPath = path.join(process.cwd(), 'credentials', 'google-credentials.json')
  
  if (fs.existsSync(credentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    visionClient = new ImageAnnotatorClient({ 
      credentials, 
      projectId: credentials.project_id 
    })
    console.log('Vision API initialized with credentials file')
  } else {
    // Fallback to environment variable
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null

    if (credentials) {
      visionClient = new ImageAnnotatorClient({
        credentials: credentials,
        projectId: credentials.project_id
      })
      console.log('Vision API initialized with environment credentials')
    } else {
      // Final fallback to API key
      visionClient = new ImageAnnotatorClient({
        key: process.env.GOOGLE_AI_API_KEY
      })
      console.log('Vision API initialized with API key')
    }
  }
} catch (error) {
  console.error('Error initializing Vision API:', error)
  // Fallback to API key only
  visionClient = new ImageAnnotatorClient({
    key: process.env.GOOGLE_AI_API_KEY
  })
  console.log('Vision API initialized with API key (fallback)')
}

export async function POST(request: NextRequest) {
  try {
    const { message, imageUrl, userId, userName, moduleContext } = await request.json()

    let toolUsed = 'general_chat'
    let enhancedMessage = message
    let extractedText = ''
    let imageAnalysis = ''
    let moduleInfo = ''

    // If image is provided, extract text first using Google Cloud Vision API
    if (imageUrl) {
      try {
        console.log('Processing image with Google Cloud Vision API...')
        
        // Extract base64 data from data URL
        const base64Data = imageUrl.replace(/^data:image\/[a-z]+;base64,/, '')
        
        // Use Google Cloud Vision API for text detection (OCR)
        const [ocrResult] = await visionClient.textDetection({
          image: { content: base64Data }
        })
        
        const rawText = ocrResult.fullTextAnnotation?.text || ''
        
        if (rawText && rawText.trim().length > 0) {
          console.log('Text extracted from image:', rawText.substring(0, 200) + '...')
          extractedText = rawText
          enhancedMessage = `I found this text in the image: "${extractedText}". ${message || 'Please help me understand or solve this question.'}`
          toolUsed = 'image_analyzer'
          imageAnalysis = `Text extracted: ${extractedText.substring(0, 100)}...`
        } else {
          console.log('No text found in image, using Gemini Vision for analysis')
          enhancedMessage = `I have an image to analyze but no text was detected. ${message || 'Please help me understand this image.'}`
          toolUsed = 'image_analyzer'
          imageAnalysis = 'No text detected, using Gemini Vision for image analysis'
        }
        
      } catch (visionError) {
        console.error('Vision API error:', visionError)
        // Fallback to Gemini Vision if Vision API fails
        enhancedMessage = `I have an image to analyze. ${message || 'Please help me understand this image.'}`
        toolUsed = 'image_analyzer'
        imageAnalysis = 'Vision API failed, using Gemini Vision as fallback'
      }
    }

    // Check if this is a problem-solving request
    const problemKeywords = [
      'solve', 'problem', 'question', 'help me', 'how to', 'what is', 'explain',
      'calculate', 'find', 'determine', 'figure out', 'work out', 'compute',
      'answer', 'solution', 'step', 'method', 'formula', 'equation'
    ]
    
    const isProblemSolving = problemKeywords.some(keyword => 
      enhancedMessage.toLowerCase().includes(keyword)
    )

    // Handle module context if provided
    if (moduleContext) {
      const { moduleTitle, currentStepTitle, currentStepContent } = moduleContext
      moduleInfo = `Module: ${moduleTitle}\nCurrent Step: ${currentStepTitle}\nStep Content: ${currentStepContent}`
      toolUsed = 'module_assistant'
      enhancedMessage = `Context: I'm studying "${moduleTitle}" and currently on the step "${currentStepTitle}". ${message}`
    }

    if (isProblemSolving) {
      toolUsed = 'problem_solver'
    }

    // Create system prompt based on the tool being used
    let systemPrompt = ''
    
    switch (toolUsed) {
      case 'problem_solver':
        systemPrompt = `You are an expert problem solver and tutor. The user is asking: "${enhancedMessage}"

${imageAnalysis ? `Image Analysis: ${imageAnalysis}` : ''}

Please provide a comprehensive, step-by-step solution that is:
- Clear and easy to understand
- Well-structured with proper paragraphs
- Conversational and engaging
- Educational with explanations

Write your response in a natural, flowing manner with:
- Clear explanations in complete sentences
- Logical flow from one concept to the next
- Proper paragraph breaks for readability
- A conversational tone that feels personal

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting like **bold**, *italic*, or \`code\`
- Use plain text only
- Avoid excessive bullet points - use them sparingly only when absolutely necessary
- Write in flowing paragraphs with clear transitions
- Use clear paragraph breaks to separate different ideas
- Keep the response clean, readable, and conversational
- Do not include any special formatting characters

Make your response educational, clear, and easy to understand. Use examples and analogies when helpful, but present them in a natural, flowing way.`
        break
        
      case 'module_assistant':
        systemPrompt = `You are an expert tutor and learning assistant. The user is studying a module and needs help.

${moduleInfo}

The user is asking: "${enhancedMessage}"

Please provide a helpful, educational response that:
- Relates directly to the module content they're studying
- Explains concepts clearly and thoroughly
- Provides additional context and examples when helpful
- Guides them through any difficulties they're facing
- Encourages deeper understanding of the topic

Write your response in a natural, flowing manner with:
- Clear explanations in complete sentences
- Logical flow from one concept to the next
- Proper paragraph breaks for readability
- A conversational tone that feels personal and encouraging
- References to the specific module content when relevant

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting like **bold**, *italic*, or \`code\`
- Use plain text only
- Avoid excessive bullet points - use them sparingly only when absolutely necessary
- Write in flowing paragraphs with clear transitions
- Use clear paragraph breaks to separate different ideas
- Keep the response clean, readable, and conversational
- Do not include any special formatting characters

Be encouraging, educational, and help the user understand the module content better.`
        break
        
      case 'image_analyzer':
        systemPrompt = `You are an expert at analyzing images and providing detailed explanations. The user has uploaded an image and is asking: "${enhancedMessage}"

${imageAnalysis ? `Image Analysis: ${imageAnalysis}` : ''}

Please provide a comprehensive analysis that includes:
- What you can see in the image
- Detailed explanation of any text, objects, or concepts shown
- Step-by-step solution if it's a problem/question
- Additional context or related information

Write your response in a natural, flowing manner with:
- Clear descriptions in complete sentences
- Logical organization of information
- Proper paragraph breaks for readability
- A conversational tone that feels personal

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting like **bold**, *italic*, or \`code\`
- Use plain text only
- Avoid excessive bullet points - use them sparingly only when absolutely necessary
- Write in flowing paragraphs with clear transitions
- Use clear paragraph breaks to separate different ideas
- Keep the response clean, readable, and conversational
- Do not include any special formatting characters

Be thorough and educational in your response, but present the information in a natural, flowing way.`
        break
        
      default:
        systemPrompt = `You are a helpful AI assistant. The user is asking: "${enhancedMessage}"

Please provide a clear, informative, and helpful response that is:
- Conversational and engaging
- Well-structured with proper paragraphs
- Easy to read and understand
- Personal and friendly

Write your response in a natural, flowing manner with:
- Clear explanations in complete sentences
- Logical flow from one idea to the next
- Proper paragraph breaks for readability
- A conversational tone that feels personal

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting like **bold**, *italic*, or \`code\`
- Use plain text only
- Avoid excessive bullet points - use them sparingly only when absolutely necessary
- Write in flowing paragraphs with clear transitions
- Use clear paragraph breaks to separate different ideas
- Keep the response clean, readable, and conversational
- Do not include any special formatting characters

Be conversational but professional, and present information in a natural, flowing way.`
    }

    console.log('Generating response with tool:', toolUsed)

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    let response
    if (imageUrl && toolUsed === 'image_analyzer') {
      // Use Gemini Vision for image analysis
      const imageData = imageUrl.replace(/^data:image\/[a-z]+;base64,/, '')
      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
      
      const result = await model.generateContent([systemPrompt, imagePart])
      response = result.response.text()
    } else {
      // Use text-only Gemini for regular queries
      const result = await model.generateContent(systemPrompt)
      response = result.response.text()
    }

    // Clean up the response to remove any remaining markdown artifacts
    const cleanResponse = response
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold** markers
      .replace(/\*([^*]+)\*/g, '$1') // Remove *italic* markers
      .replace(/`([^`]+)`/g, '$1') // Remove `code` markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [link](url) format
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points and convert to plain text
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim()

    console.log('Response generated successfully')

    // Save conversation to database (optional)
    // await saveConversation(userId, message, cleanResponse, toolUsed)

    return NextResponse.json({
      response: cleanResponse,
      toolUsed,
      timestamp: new Date().toISOString(),
      imageAnalysis: imageAnalysis || null,
      extractedText: extractedText || null,
      moduleContext: moduleContext || null
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
