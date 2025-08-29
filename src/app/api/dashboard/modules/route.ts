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

    // Get user's modules with progress
    const userModules = await prisma.userModule.findMany({
      where: { userId: session.user.id },
      include: { 
        module: {
          include: {
            steps: true,
            quizzes: true,
            flashcards: true
          }
        }
      },
      orderBy: { id: 'desc' }
    }).catch(() => []) // Return empty array if query fails

    // Transform to match the interface
    const modules = userModules.map(um => ({
      id: um.module.id,
      title: um.module.title,
      description: um.module.description || 'No description available',
      progress: um.progress,
      isCompleted: um.completed,
      lastAccessed: new Date(),
      estimatedTime: um.module.steps.length * 5, // 5 minutes per step
      difficulty: 'intermediate' as const, // You can add difficulty field to Module model
      category: 'Programming' // You can add category field to Module model
    }))

    return NextResponse.json({
      data: modules,
      success: true,
      message: 'Modules fetched successfully'
    })
  } catch (error) {
    console.error('Dashboard modules error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch modules',
      success: false,
      message: 'Failed to fetch modules'
    }, { status: 500 })
  }
}
