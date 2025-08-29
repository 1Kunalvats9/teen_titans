import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface QuizAttemptRequest {
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeTaken: number
}

export async function POST(request: NextRequest) {
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

    const body: QuizAttemptRequest = await request.json()
    const { quizId, score, totalQuestions, correctAnswers, timeTaken } = body

    // Verify the quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Create quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        score
      }
    })

    return NextResponse.json({
      message: 'Quiz attempt saved successfully',
      attempt: quizAttempt
    })
  } catch (error) {
    console.error('Error saving quiz attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
