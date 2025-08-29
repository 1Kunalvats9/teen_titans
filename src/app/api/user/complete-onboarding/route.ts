import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { persona, imageUrl } = await req.json()

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        persona: persona ?? undefined,
        image: imageUrl ?? undefined,
        isOnboarded: true,
      },
      select: { id: true, persona: true, image: true, isOnboarded: true },
    })

    return NextResponse.json({
      data: { success: true, message: 'Onboarding completed successfully' },
      success: true,
      message: 'Onboarding completed successfully'
    })
  } catch (e) {
    console.error('Complete onboarding error:', e)
    return NextResponse.json({ 
      error: 'Failed to complete onboarding',
      success: false,
      message: 'Failed to complete onboarding'
    }, { status: 500 })
  }
}


