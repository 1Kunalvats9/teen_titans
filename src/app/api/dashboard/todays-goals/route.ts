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

    // For now, synthesize simple daily goals based on user modules and quiz attempts
    const [userModules, quizAttempts] = await Promise.all([
      prisma.userModule.findMany({
        where: { userId: session.user.id },
        include: { module: true },
        orderBy: { id: 'desc' },
        take: 10
      }).catch(() => []),
      prisma.quizAttempt.count({ where: { userId: session.user.id } }).catch(() => 0)
    ])

    const goals = [
      {
        id: 'goal-1',
        task: userModules.length > 0 
          ? (userModules[0]?.completed
            ? `Review ${userModules[0].module.title}`
            : `Progress ${userModules[0].module.title} by 20%`)
          : 'Start your first learning module',
        completed: userModules.length > 0 && !!userModules[0]?.completed
      },
      {
        id: 'goal-2',
        task: 'Review 15 flashcards',
        completed: false
      },
      {
        id: 'goal-3',
        task: quizAttempts > 0 ? 'Retake a quiz to improve score' : 'Take your first quiz',
        completed: false
      }
    ]

    return NextResponse.json({
      data: goals,
      success: true,
      message: 'Today\'s goals fetched successfully'
    })
  } catch (error) {
    console.error('Dashboard goals error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch goals',
      success: false,
      message: 'Failed to fetch goals'
    }, { status: 500 })
  }
}


