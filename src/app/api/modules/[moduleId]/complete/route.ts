import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.moduleId

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

    // Check if module is already completed
    if (userModule.completed) {
      return NextResponse.json({ 
        error: 'Module already completed',
        success: false,
        message: 'Module already completed'
      }, { status: 400 })
    }

    // Complete the module
    const updatedUserModule = await prisma.userModule.update({
      where: {
        id: userModule.id
      },
      data: {
        progress: 1.0,
        completed: true
      }
    })

    // Get the module details
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    // Update user's streak (optional)
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        streak: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      data: {
        id: module?.id,
        title: module?.title,
        progress: updatedUserModule.progress,
        completed: updatedUserModule.completed
      },
      success: true,
      message: 'Module completed successfully'
    })
  } catch (error) {
    console.error('Complete module error:', error)
    return NextResponse.json({ 
      error: 'Failed to complete module',
      success: false,
      message: 'Failed to complete module'
    }, { status: 500 })
  }
}
