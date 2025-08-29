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

    // Get user status from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isOnboarded: true,
        persona: true,
        image: true,
        name: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: user,
      success: true,
      message: 'User status fetched successfully'
    })
  } catch (error) {
    console.error('User status error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user status',
      success: false,
      message: 'Failed to fetch user status'
    }, { status: 500 })
  }
}
