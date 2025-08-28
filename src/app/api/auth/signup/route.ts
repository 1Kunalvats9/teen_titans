// app/api/signup/route.ts (your file)
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Import the crypto module
import { transporter, mailOptions } from '@/lib/nodemailer'; // Import the transporter

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1. Generate a secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600 * 1000); // Expires in 1 hour

    // 2. Create the user with the token
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // 3. Send the verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Thanks for signing up! Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return NextResponse.json(
      { message: 'User created. Please check your email to verify your account.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}