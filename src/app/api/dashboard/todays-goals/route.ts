import { NextRequest, NextResponse } from 'next/server'
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

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's goals
    const goals = await prisma.todaysGoal.findMany({
      where: { 
        userId: session.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      },
      orderBy: { createdAt: 'asc' }
    }).catch(() => [])

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

export async function POST(request: NextRequest) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { task } = await request.json()

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Task is required and must be a non-empty string',
        success: false
      }, { status: 400 })
    }

    // Create new goal
    const goal = await prisma.todaysGoal.create({
      data: {
        task: task.trim(),
        userId: session.user.id,
        date: new Date() // Today's date
      }
    })

    return NextResponse.json({
      data: goal,
      success: true,
      message: 'Goal created successfully'
    })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json({ 
      error: 'Failed to create goal',
      success: false,
      message: 'Failed to create goal'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, completed, task } = await request.json()

    if (!id) {
      return NextResponse.json({ 
        error: 'Goal ID is required',
        success: false
      }, { status: 400 })
    }

    // Update goal
    const updateData: any = {}
    if (typeof completed === 'boolean') {
      updateData.completed = completed
    }
    if (task && typeof task === 'string' && task.trim().length > 0) {
      updateData.task = task.trim()
    }

    const goal = await prisma.todaysGoal.update({
      where: { 
        id,
        userId: session.user.id // Ensure user owns the goal
      },
      data: updateData
    })

    return NextResponse.json({
      data: goal,
      success: true,
      message: 'Goal updated successfully'
    })
  } catch (error) {
    console.error('Update goal error:', error)
    return NextResponse.json({ 
      error: 'Failed to update goal',
      success: false,
      message: 'Failed to update goal'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        error: 'Goal ID is required',
        success: false
      }, { status: 400 })
    }

    // Delete goal
    await prisma.todaysGoal.delete({
      where: { 
        id,
        userId: session.user.id // Ensure user owns the goal
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    })
  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete goal',
      success: false,
      message: 'Failed to delete goal'
    }, { status: 500 })
  }
}


