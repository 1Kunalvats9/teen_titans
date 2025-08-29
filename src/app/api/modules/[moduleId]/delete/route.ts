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

    // Instead of deleting, we'll mark it as not public (soft delete)
    // This keeps it in the database but removes it from user's dashboard
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: { isPublic: false }
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
