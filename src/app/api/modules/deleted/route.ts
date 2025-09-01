import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get modules that the user has marked as deleted
    const deletedUserModules = await prisma.userModule.findMany({
      where: {
        userId: user.id,
        deleted: true
      },
      include: {
        module: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                steps: true,
                quizzes: true
              }
            }
          }
        }
      },
      orderBy: {
        module: {
          createdAt: 'desc'
        }
      }
    })

    // Transform to match the Module interface
    const deletedModules = deletedUserModules.map(um => ({
      id: um.module.id,
      title: um.module.title,
      description: um.module.description,
      isPublic: um.module.isPublic,
      createdAt: um.module.createdAt,
      creatorId: um.module.creatorId,
      creator: um.module.creator,
      _count: um.module._count,
      steps: [],
      quizzes: []
    }))

    return NextResponse.json(deletedModules)
  } catch (error) {
    console.error('Error fetching deleted modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
