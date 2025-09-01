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
  debug: process.env.NODE_ENV === 'development',
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
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }
        
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        })
        
        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }
        
        if (!user.password) {
          console.log('User has no password (OAuth user)')
          return null
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          console.log('Invalid password for user:', credentials.email)
          return null
        }
        
        console.log('User authenticated successfully:', credentials.email)
        return { 
          id: user.id, 
          name: user.name ?? null, 
          email: user.email ?? null, 
          image: user.image ?? null,
          emailVerified: user.emailVerified,
          isOnboarded: user.isOnboarded ?? false,
          persona: user.persona ?? null
        }
      },
    }),
  ],
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT & { id?: string; emailVerified?: Date | null; isOnboarded?: boolean; persona?: string | null }; user?: { id: string; name?: string | null; email?: string | null; image?: string | null; emailVerified?: Date | null; isOnboarded?: boolean; persona?: string | null } }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
        token.emailVerified = user.emailVerified || null
        token.isOnboarded = user.isOnboarded ?? false
        token.persona = user.persona ?? null
        return token
      }

      // Re-sync user data from DB to ensure we have the latest information
      if (token?.id) {
        try {
          const dbUser = await prisma.user.findUnique({ 
            where: { id: token.id as string },
            select: {
              name: true,
              email: true,
              image: true,
              emailVerified: true,
              isOnboarded: true,
              persona: true
            }
          })
          if (dbUser) {
            // Always update with the latest data from database
            token.name = dbUser.name
            token.email = dbUser.email
            token.image = dbUser.image
            token.emailVerified = dbUser.emailVerified || null
            token.isOnboarded = dbUser.isOnboarded ?? false
            token.persona = dbUser.persona ?? null
          }
        } catch {
          // Swallow errors to avoid breaking auth; keep existing token values
        }
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT & { id?: string; emailVerified?: Date | null; isOnboarded?: boolean; persona?: string | null } }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.image
        session.user.emailVerified = (token.emailVerified as Date | null) || null
        ;(session.user as unknown as { isOnboarded?: boolean }).isOnboarded = token.isOnboarded ?? false
        ;(session.user as unknown as { persona?: string | null }).persona = token.persona ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request', 
  },
} as const
