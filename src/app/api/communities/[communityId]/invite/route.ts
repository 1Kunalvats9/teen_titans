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
    const { inviteeEmail } = await request.json()

    if (!inviteeEmail || typeof inviteeEmail !== 'string') {
      return NextResponse.json({ error: 'Invitee email is required' }, { status: 400 })
    }

    // Check if community exists and user is a member
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: {
            userId: session.user.id
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    if (community.members.length === 0) {
      return NextResponse.json({ error: 'You must be a member to send invites' }, { status: 403 })
    }

    // Find the invitee user
    const invitee = await prisma.user.findUnique({
      where: { email: inviteeEmail }
    })

    if (!invitee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (invitee.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    // Check if user is already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: invitee.id,
          communityId: communityId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.communityInvite.findFirst({
      where: {
        inviteeId: invitee.id,
        communityId: communityId,
        status: 'PENDING'
      }
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent' }, { status: 400 })
    }

    // Create invite (expires in 7 days)
    const invite = await prisma.communityInvite.create({
      data: {
        inviterId: session.user.id,
        inviteeId: invitee.id,
        communityId: communityId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        community: {
          select: { name: true }
        },
        inviter: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
