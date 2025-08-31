import { NextResponse } from 'next/server'
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params

    // Get conversation with messages
    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      conversation
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch conversation',
      success: false
    }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params
    const { message } = await request.json()

    // Verify conversation exists and belongs to user
    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Save user message
    const userMessage = await prisma.aiMessage.create({
      data: {
        role: 'USER',
        content: message,
        conversationId: conversationId
      }
    })

    // Generate AI response
    const conversationHistory = conversation.messages.map(msg => 
      `${msg.role === 'USER' ? 'Student' : 'Alisha'}: ${msg.content}`
    ).join('\n')

    const { text: aiResponse } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are Alisha, a friendly and patient AI learning assistant. You help students learn various topics in technology through conversation.

Your personality:
- Friendly, encouraging, and patient
- Clear and structured in explanations
- Use real-world examples to illustrate concepts
- Ask follow-up questions to ensure understanding
- Provide positive reinforcement and encouragement
- Speak in a conversational, approachable tone

Current conversation context:
${conversationHistory}

Student's latest message: ${message}

Respond as Alisha, providing helpful, educational, and encouraging feedback. Keep your response conversational and suitable for voice interaction. Avoid using special characters that might break voice synthesis.

Your response should be:
- Educational and informative
- Encouraging and supportive
- Clear and easy to understand
- Conversational in tone
- Appropriate for the learning context

Respond naturally as Alisha:`,
    })

    // Save AI response
    const aiMessage = await prisma.aiMessage.create({
      data: {
        role: 'AI',
        content: aiResponse,
        conversationId: conversationId
      }
    })

    // Update conversation timestamp
    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      userMessage,
      aiMessage
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ 
      error: 'Failed to send message',
      success: false
    }, { status: 500 })
  }
}
