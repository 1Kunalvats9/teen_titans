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

    // Get user's learning statistics
    const [
      userModules,
      quizAttempts,
      totalStudyTime,
      weeklyProgress
    ] = await Promise.all([
      // Get module progress
      prisma.userModule.findMany({
        where: { userId: session.user.id },
        include: { module: true }
      }).catch(() => []), // Return empty array if query fails
      
      // Get quiz attempts
      prisma.quizAttempt.findMany({
        where: { userId: session.user.id },
        include: { quiz: true }
      }).catch(() => []), // Return empty array if query fails
      
      // Calculate total study time (placeholder - you can implement actual tracking)
      Promise.resolve(0),
      
      // Calculate weekly progress
      prisma.quizAttempt.findMany({
        where: { 
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }).catch(() => []) // Return empty array if query fails
    ])

    const completedModules = userModules.filter(um => um.completed).length
    const totalModules = userModules.length
    const averageScore = quizAttempts.length > 0 
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
      : 0

    // Calculate study streak (placeholder - implement actual streak logic)
    const studyStreak = 0 // Start with 0 for new users

    const stats = {
      totalModules,
      completedModules,
      totalQuizzes: quizAttempts.length,
      averageScore: Math.round(averageScore * 100) / 100,
      studyStreak,
      totalStudyTime,
      weeklyProgress: weeklyProgress.length
    }

    return NextResponse.json({
      data: stats,
      success: true,
      message: 'Stats fetched successfully'
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      success: false,
      message: 'Failed to fetch stats'
    }, { status: 500 })
  }
}
