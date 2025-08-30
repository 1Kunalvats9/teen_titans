import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
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

    // Check if the module exists
    const moduleData = await prisma.module.findFirst({
      where: {
        id: moduleId
      }
    })

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Mark the module as not deleted for this user
    await prisma.userModule.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: moduleId
        }
      },
      update: {
        deleted: false
      },
      create: {
        userId: user.id,
        moduleId: moduleId,
        deleted: false
      }
    })

    return NextResponse.json({ 
      message: 'Module restored to your dashboard',
      moduleId 
    })
  } catch (error) {
    console.error('Error restoring module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
