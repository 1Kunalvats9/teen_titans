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

    // Check if user is a member of the community
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: communityId,
        },
      },
      select: { role: true }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 403 })
    }

    // Get all members with their details
    const members = await prisma.communityMember.findMany({
      where: { communityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { role: 'desc' }, // Admins first
        { joinedAt: 'asc' } // Then by join date
      ]
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching community members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { communityId } = await params
    const { action, targetUserId, newRole } = await request.json()

    // Check if user is admin of the community
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: communityId,
        },
      },
      select: { role: true }
    })

    if (!membership || !['ADMIN', 'MODERATOR'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can manage members' }, { status: 403 })
    }

    if (action === 'changeRole') {
      // Change member role
      await prisma.communityMember.update({
        where: {
          userId_communityId: {
            userId: targetUserId,
            communityId: communityId,
          },
        },
        data: { role: newRole }
      })

      return NextResponse.json({ success: true })
    } else if (action === 'removeMember') {
      // Remove member from community
      await prisma.communityMember.delete({
        where: {
          userId_communityId: {
            userId: targetUserId,
            communityId: communityId,
          },
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing community members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}