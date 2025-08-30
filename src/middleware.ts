import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getToken } = require('next-auth/jwt') as {
  getToken: (args: { req: NextRequest; secret?: string }) => Promise<Record<string, unknown> | null>
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public pages that don't require authentication
  const publicPages = ['/', '/login', '/signup', '/verify-request']
  const isPublicPage = publicPages.includes(pathname)

  // Guard dashboard and modules routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/modules')) {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      // Only redirect if there's definitely no token
      if (token === null) {
        const url = new URL('/login', req.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // If there's an error checking the token, allow the request to continue
      // The client-side auth check will handle it properly
      console.error('Middleware auth error:', error)
    }
  }

  // Redirect authenticated users away from auth pages
  if (isPublicPage && pathname !== '/') {
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (token) {
        const url = new URL('/dashboard', req.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Middleware auth redirect error:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/modules/:path*', '/login', '/signup'],
}


