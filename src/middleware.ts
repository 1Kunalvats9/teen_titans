import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getToken } = require('next-auth/jwt') as {
  getToken: (args: { req: NextRequest; secret?: string }) => Promise<Record<string, unknown> | null>
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const url = new URL('/login', req.url)
      return NextResponse.redirect(url)
    }

    // Note: Onboarding is now handled by a modal, so we don't redirect to onboarding page
    // Users will see the onboarding modal automatically if they're not onboarded
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}


