// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        })
        
        if (!user || !user.password || !user.emailVerified) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        
        return { 
          id: user.id, 
          name: user.name ?? null, 
          email: user.email ?? null, 
          image: user.image ?? null ,
          emailVerified: user.emailVerified
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }: { token: JWT & { id?: string; emailVerified?: Date | null; isOnboarded?: boolean; persona?: string | null; onboardingStep?: number }; user?: { id: string; name?: string | null; email?: string | null; image?: string | null; emailVerified?: Date | null; isOnboarded?: boolean; persona?: string | null; onboardingStep?: number } }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
        token.emailVerified = user.emailVerified || null
        token.isOnboarded = user.isOnboarded ?? false
        token.persona = user.persona ?? null
        token.onboardingStep = user.onboardingStep ?? 0
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT & { id?: string; emailVerified?: Date | null; isOnboarded?: boolean; persona?: string | null; onboardingStep?: number } }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.image
        session.user.emailVerified = (token.emailVerified as Date | null) || null
        ;(session.user as unknown as { isOnboarded?: boolean }).isOnboarded = token.isOnboarded ?? false
        ;(session.user as unknown as { persona?: string | null }).persona = token.persona ?? null
        ;(session.user as unknown as { onboardingStep?: number }).onboardingStep = token.onboardingStep ?? 0
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request', 
  },
} as const

const handler = (NextAuth as unknown as (opts: unknown) => (req: Request) => Promise<Response>)(authOptions)
export const GET = handler
export const POST = handler