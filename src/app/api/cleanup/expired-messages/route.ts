import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Delete expired messages
    const result = await prisma.communityMessage.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    console.log(`Cleaned up ${result.count} expired messages`)

    return NextResponse.json({ 
      message: 'Cleanup completed',
      deletedCount: result.count
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
