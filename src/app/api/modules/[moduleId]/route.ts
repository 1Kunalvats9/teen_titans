import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { moduleId } = await params

    // Fetch module with steps and quizzes
    const moduleData = await prisma.module.findFirst({
      where: {
        id: moduleId,
        OR: [
          { isPublic: true },
          { creatorId: user.id }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        quizzes: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    })

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(moduleData)
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
