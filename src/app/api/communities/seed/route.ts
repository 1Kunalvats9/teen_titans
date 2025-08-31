import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if communities already exist
    const existingCommunities = await prisma.community.count()
    if (existingCommunities > 0) {
      return NextResponse.json({ message: 'Communities already seeded' })
    }

    // Create sample communities
    const communities = await Promise.all([
      prisma.community.create({
        data: {
          name: 'JavaScript Learners',
          description: 'A community for JavaScript enthusiasts to share knowledge and help each other learn.',
        }
      }),
      prisma.community.create({
        data: {
          name: 'React Developers',
          description: 'Connect with React developers, share projects, and discuss best practices.',
        }
      }),
      prisma.community.create({
        data: {
          name: 'Web Development',
          description: 'General web development discussions, tips, and project sharing.',
        }
      }),
      prisma.community.create({
        data: {
          name: 'AI & Machine Learning',
          description: 'Explore the world of AI and machine learning with fellow enthusiasts.',
        }
      }),
      prisma.community.create({
        data: {
          name: 'Design & UX',
          description: 'Share design inspiration, discuss UX principles, and collaborate on projects.',
        }
      }),
    ])

    return NextResponse.json({ 
      message: 'Communities seeded successfully',
      communities: communities.length
    })
  } catch (error) {
    console.error('Error seeding communities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
