import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const communityId = searchParams.get('communityId')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    if (!communityId) {
      return NextResponse.json({ error: 'Community ID is required' }, { status: 400 })
    }

    // Verify user is a member of the community
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
      return NextResponse.json({ error: 'You must be a member to search for users to invite' }, { status: 403 })
    }

    // Search for users by name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.trim(), mode: 'insensitive' } },
          { email: { contains: query.trim(), mode: 'insensitive' } }
        ],
        AND: {
          id: { not: session.user.id } // Exclude current user
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 10 // Limit results
    })

    // Filter out users who are already members or have pending invites
    const filteredUsers = await Promise.all(
      users.map(async (user) => {
        const [isMember, hasPendingInvite] = await Promise.all([
          prisma.communityMember.findUnique({
            where: {
              userId_communityId: {
                userId: user.id,
                communityId: communityId,
              },
            },
          }),
          prisma.communityInvite.findFirst({
            where: {
              inviteeId: user.id,
              communityId: communityId,
              status: 'PENDING'
            }
          })
        ])

        return {
          ...user,
          isMember: !!isMember,
          hasPendingInvite: !!hasPendingInvite
        }
      })
    )

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
