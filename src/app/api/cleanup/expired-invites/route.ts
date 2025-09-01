import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Delete expired invites
    const result = await prisma.communityInvite.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count,
      message: `Cleaned up ${result.count} expired invites`
    })
  } catch (error) {
    console.error('Error cleaning up expired invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
