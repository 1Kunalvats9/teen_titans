import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { communityId } = await params

    // Check if community exists and is active
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, isActive: true, isPrivate: true }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    if (!community.isActive) {
      return NextResponse.json({ error: 'Community is not active' }, { status: 400 })
    }

    if (community.isPrivate) {
      return NextResponse.json({ error: 'Cannot join private communities directly. You need an invitation.' }, { status: 403 })
    }

    // Check if user is already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: communityId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Add user to community
    await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId: communityId,
        role: 'MEMBER',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining community:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
