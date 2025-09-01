import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent AI conversations with message count
    const conversations = await prisma.aiConversation.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    }).catch(() => []) // Return empty array if query fails

    // Transform to match interface
    const aiConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title || 'Untitled Conversation',
      lastMessage: conv.messages[0]?.content || 'No messages yet',
      timestamp: conv.updatedAt,
      messageCount: conv._count.messages
    }))

    return NextResponse.json({
      data: aiConversations,
      success: true,
      message: 'AI conversations fetched successfully'
    })
  } catch (error) {
    console.error('Dashboard AI conversations error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch AI conversations',
      success: false,
      message: 'Failed to fetch AI conversations'
    }, { status: 500 })
  }
}
