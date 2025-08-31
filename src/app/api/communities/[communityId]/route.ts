import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { communityId } = await params

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            userId: true,
            role: true,
          },
        },
      },
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Check if user is a member
    const isMember = community.members.length > 0

    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    return NextResponse.json({ community })
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
