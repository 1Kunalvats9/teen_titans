import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { progress, completed } = await request.json()
    const moduleId = params.moduleId

    // Validate input
    if (typeof progress !== 'number' || progress < 0 || progress > 1) {
      return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
    }

    // Check if user has access to this module
    const userModule = await prisma.userModule.findFirst({
      where: {
        userId: session.user.id,
        moduleId: moduleId,
        deleted: false
      }
    })

    if (!userModule) {
      return NextResponse.json({ error: 'Module not found or access denied' }, { status: 404 })
    }

    // Update the user module progress
    const updatedUserModule = await prisma.userModule.update({
      where: {
        id: userModule.id
      },
      data: {
        progress: progress,
        completed: completed || false
      }
    })

    // Get the module details
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    return NextResponse.json({
      data: {
        id: module?.id,
        title: module?.title,
        progress: updatedUserModule.progress,
        completed: updatedUserModule.completed
      },
      success: true,
      message: 'Progress updated successfully'
    })
  } catch (error) {
    console.error('Update module progress error:', error)
    return NextResponse.json({ 
      error: 'Failed to update progress',
      success: false,
      message: 'Failed to update progress'
    }, { status: 500 })
  }
}
