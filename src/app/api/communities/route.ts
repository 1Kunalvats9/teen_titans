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

    const communities = await prisma.community.findMany({
      where: {
        isActive: true,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ communities })
  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Community name is required' }, { status: 400 })
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Community name must be less than 100 characters' }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description must be less than 500 characters' }, { status: 400 })
    }

    // Create community
    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    })

    // Add creator as admin member
    await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({ community })
  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
