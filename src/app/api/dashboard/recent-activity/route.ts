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

    // Get recent activities from different sources
    const [
      recentModules,
      recentQuizzes,
      recentFlashcards
    ] = await Promise.all([
      // Recent module completions
      prisma.userModule.findMany({
        where: { 
          userId: session.user.id,
          completed: true
        },
        include: { module: true },
        orderBy: { progress: 'desc' },
        take: 5
      }).catch(() => []),

      // Recent quiz attempts
      prisma.quizAttempt.findMany({
        where: { 
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: { quiz: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }).catch(() => []),

      // Recent flashcard reviews
      prisma.userFlashcard.findMany({
        where: { 
          userId: session.user.id,
          nextReview: {
            lte: new Date()
          }
        },
        include: { flashcard: { include: { module: true } } },
        orderBy: { nextReview: 'desc' },
        take: 5
      }).catch(() => []),


    ])

    // Transform activities to match interface
    const activities = [
      ...recentModules.map(um => ({
        id: um.id,
        type: 'module_completed' as const,
        title: `Completed ${um.module.title}`,
        description: `You finished the ${um.module.title} module`,
        // UserModule currently has no timestamp fields; use current time for display ordering
        timestamp: new Date(),
        icon: '📚'
      })),
      
      ...recentQuizzes.map(qa => ({
        id: qa.id,
        type: 'quiz_taken' as const,
        title: `Quiz: ${qa.quiz.title}`,
        description: `Scored ${Math.round(qa.score)}% on ${qa.quiz.title}`,
        timestamp: qa.createdAt,
        icon: '🧠'
      })),
      
      ...recentFlashcards.map(uf => ({
        id: uf.id,
        type: 'flashcard_reviewed' as const,
        title: `Flashcard Review`,
        description: `Reviewed flashcards in ${uf.flashcard.module.title}`,
        timestamp: uf.nextReview,
        icon: '🔄'
      })),
      

    ]

    // Sort by timestamp and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      data: sortedActivities,
      success: true,
      message: 'Recent activity fetched successfully'
    })
  } catch (error) {
    console.error('Dashboard recent activity error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch recent activity',
      success: false,
      message: 'Failed to fetch recent activity'
    }, { status: 500 })
  }
}
