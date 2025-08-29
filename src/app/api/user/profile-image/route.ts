import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: Request) {
  try {
    const session = (await (getServerSession as unknown as (opts?: unknown) => Promise<Session | null>)(authOptions))
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { file, folder } = await req.json()
    if (!file) {
      return NextResponse.json({ error: 'file (base64 or remote url) required' }, { status: 400 })
    }

    // Validate that required environment variables are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables are missing')
      return NextResponse.json({ error: 'Cloudinary configuration error' }, { status: 500 })
    }

    // Validate file format (should be base64 data URL)
    if (!file.startsWith('data:image/')) {
      console.error('Invalid file format. Expected base64 data URL, got:', file.substring(0, 100))
      return NextResponse.json({ error: 'Invalid file format. Expected base64 data URL' }, { status: 400 })
    }

    console.log('Starting Cloudinary upload...')
    console.log('File size (approx):', Math.round(file.length * 0.75), 'bytes')
    
    const upload = await cloudinary.uploader.upload(file, {
      folder: folder || 'teen_titans/profile_images',
      overwrite: true,
      unique_filename: true,
      resource_type: 'image',
    })
    console.log('Cloudinary upload successful:', upload.secure_url)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: upload.secure_url },
      select: { id: true, image: true }
    })

    return NextResponse.json({ success: true, user })
  } catch (e) {
    console.error('Profile image upload error:', e)
    
    // Check if it's a Cloudinary-specific error
    if (e instanceof Error && e.message.includes('cloudinary')) {
      return NextResponse.json({ 
        error: 'Cloudinary upload failed', 
        details: e.message
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to save image', 
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

