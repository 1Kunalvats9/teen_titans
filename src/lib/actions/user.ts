'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'

export async function updateUserProfile(data: {
  name?: string
  image?: File | string
}) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const updateData: any = {}

  // Handle name update
  if (data.name !== undefined) {
    updateData.name = data.name
  }

  // Handle image update
  if (data.image) {
    if (typeof data.image === 'string') {
      // If it's already a URL, use it directly
      updateData.image = data.image
    } else {
      // If it's a File, upload to Cloudinary
      try {
        const imageUrl = await uploadImageToCloudinary(data.image)
        updateData.image = imageUrl
      } catch (error) {
        throw new Error('Failed to upload image')
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isOnboarded: true,
      xp: true,
      streak: true,
      persona: true,
    }
  })

  return updatedUser
}

async function uploadImageToCloudinary(file: File): Promise<string> {
  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64String = buffer.toString('base64')
  const dataURI = `data:${file.type};base64,${base64String}`

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile-images',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    })
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}
