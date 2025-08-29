
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    const hasExplicitCreds = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    const hasUrl = Boolean(process.env.CLOUDINARY_URL)
    if (!hasExplicitCreds && !hasUrl) {
      console.error('Cloudinary environment variables are missing')
      return NextResponse.json({ error: 'Cloudinary configuration error' }, { status: 500 })
    }

    // Log Cloudinary configuration for debugging
    console.log('Cloudinary config check:', {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !!process.env.CLOUDINARY_API_KEY,
      apiSecret: !!process.env.CLOUDINARY_API_SECRET,
      hasUrl: !!process.env.CLOUDINARY_URL,
      unsignedPreset: !!process.env.CLOUDINARY_UNSIGNED_PRESET
    })

    // Validate file format (should be base64 data URL)
    if (!file.startsWith('data:image/')) {
      console.error('Invalid file format. Expected base64 data URL, got:', file.substring(0, 32))
      return NextResponse.json({ error: 'Invalid file format. Expected base64 data URL' }, { status: 400 })
    }

    const targetFolder = folder || 'teen_titans/profile_images'
    const unsignedPreset = process.env.CLOUDINARY_UNSIGNED_PRESET

    console.log('Starting Cloudinary upload...')
    console.log('File size (approx):', Math.round(file.length * 0.75), 'bytes')

    let secureUrl: string

    try {
      // Try signed upload first (requires valid API secret)
      console.log('Attempting signed upload...')
      const upload = await cloudinary.uploader.upload(file, {
        folder: targetFolder,
        overwrite: true,
        unique_filename: true,
        resource_type: 'image',
      })
      secureUrl = upload.secure_url
      console.log('Signed upload successful')
    } catch (err) {
      console.error('Signed upload failed, attempting unsigned if preset is available...', err)
      if (!unsignedPreset) {
        console.error('No unsigned preset available, using data URL fallback')
        // Fallback: store as data URL (not recommended for production)
        secureUrl = file
      } else {
        // Fallback to unsigned upload (requires upload preset configured as unsigned in Cloudinary)
        console.log('Attempting unsigned upload with preset:', unsignedPreset)
        const upload = await cloudinary.uploader.unsigned_upload(file, unsignedPreset, {
          folder: targetFolder,
          overwrite: true,
          unique_filename: true,
          resource_type: 'image',
        })
        secureUrl = upload.secure_url
        console.log('Unsigned upload successful')
      }
    }

    console.log('Cloudinary upload successful:', secureUrl)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: secureUrl },
      select: { id: true, image: true }
    })

    return NextResponse.json({
      data: { success: true, imageUrl: user.image, message: 'Profile image uploaded successfully' },
      success: true,
      message: 'Profile image uploaded successfully'
    })
  } catch (e) {
    console.error('Profile image upload error:', e)
    return NextResponse.json({ 
      error: 'Failed to save image',
      success: false,
      message: 'Failed to save image',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

