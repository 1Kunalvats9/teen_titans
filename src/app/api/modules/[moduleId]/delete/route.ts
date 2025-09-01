import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
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

    // Check if the module exists and belongs to the user
    const moduleData = await prisma.module.findFirst({
      where: {
        id: moduleId,
        creatorId: user.id
      }
    })

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // Mark the module as deleted for this specific user
    // This keeps the module in the database for other users but hides it from the creator
    await prisma.userModule.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: moduleId
        }
      },
      update: {
        deleted: true
      },
      create: {
        userId: user.id,
        moduleId: moduleId,
        deleted: true
      }
    })

    return NextResponse.json({ 
      message: 'Module removed from your dashboard',
      moduleId 
    })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
