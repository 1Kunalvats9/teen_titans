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
      createdModules,
      quizAttempts,
      studySessions,
      weeklyProgress,
      user
    ] = await Promise.all([
      // Get module progress (modules user has started)
      prisma.userModule.findMany({
        where: { userId: session.user.id },
        include: { module: true }
      }).catch(() => []), // Return empty array if query fails
      
      // Get modules created by the user
      prisma.module.findMany({
        where: { 
          creatorId: session.user.id,
          isPublic: true // Only count public modules
        }
      }).catch(() => []), // Return empty array if query fails
      
      // Get quiz attempts
      prisma.quizAttempt.findMany({
        where: { userId: session.user.id },
        include: { quiz: true }
      }).catch(() => []), // Return empty array if query fails
      
      // Get study sessions
      prisma.studySession.findMany({
        where: { userId: session.user.id },
        orderBy: { startTime: 'desc' }
      }).catch(() => []), // Return empty array if query fails
      
      // Calculate weekly progress
      prisma.quizAttempt.findMany({
        where: { 
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }).catch(() => []), // Return empty array if query fails
      
      // Get user data for streak
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { streak: true }
      }).catch(() => ({ streak: 0 }))
    ])

    const completedModules = userModules.filter(um => um.completed).length
    const totalModules = createdModules.length // Count modules created by user
    const averageScore = quizAttempts.length > 0 
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
      : 0

    // Calculate total study time from study sessions
    const totalStudyTime = studySessions.reduce((total, session) => {
      if (session.duration) {
        return total + session.duration
      }
      // If no duration recorded, calculate from start/end time
      if (session.startTime && session.endTime) {
        const duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))
        return total + duration
      }
      return total
    }, 0)

    // Calculate study streak (use user's streak from database)
    const studyStreak = user?.streak || 0

    const stats = {
      totalModules,
      completedModules,
      totalQuizzes: quizAttempts.length,
      averageScore: Math.round(averageScore),
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
