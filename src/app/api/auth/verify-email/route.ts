// app/api/verify-email/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is missing' }, { status: 400 });
    }

    // Find the user with this token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Check if the token has expired
    if (new Date() > user.verificationTokenExpiry!) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 410 });
    }

    // Update the user to mark them as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(), // Set the verification date
        verificationToken: null, // Clear the token
        verificationTokenExpiry: null, // Clear the expiry
      },
    });

    // Redirect the user to a success page or the login page
    const loginUrl = new URL('/login?verified=true', process.env.NEXTAUTH_URL);
    return NextResponse.redirect(loginUrl);

  } catch (error) {
    console.error('Verification error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}