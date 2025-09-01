import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inviteId } = await params
    const { action } = await request.json()

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Find the invite and verify it belongs to the user
    const invite = await prisma.communityInvite.findUnique({
      where: { id: inviteId },
      include: {
        community: true
      }
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.inviteeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 })
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    // Update invite status
    await prisma.communityInvite.update({
      where: { id: inviteId },
      data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
    })

    if (action === 'accept') {
      // Add user to community
      await prisma.communityMember.create({
        data: {
          userId: session.user.id,
          communityId: invite.communityId,
          role: 'MEMBER',
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inviteId } = await params

    // Find the invite and verify it belongs to the user
    const invite = await prisma.communityInvite.findUnique({
      where: { id: inviteId }
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.inviteeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the invite
    await prisma.communityInvite.delete({
      where: { id: inviteId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
