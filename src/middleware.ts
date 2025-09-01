import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getToken } = require('next-auth/jwt') as {
  getToken: (args: { req: NextRequest; secret?: string }) => Promise<Record<string, unknown> | null>
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  console.log('Middleware processing pathname:', pathname)

  // Public pages that don't require authentication
  const publicPages = ['/', '/login', '/signup', '/verify-request']
  const isPublicPage = publicPages.includes(pathname)

  // Guard dashboard, modules, and community routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/modules') || pathname.startsWith('/community')) {
    console.log('Protected route detected:', pathname)
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      console.log('Token check result:', token ? 'Token found' : 'No token')

      // Only redirect if there's definitely no token
      if (token === null) {
        console.log('Redirecting to login - no token found')
        const url = new URL('/login', req.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // If there's an error checking the token, allow the request to continue
      // The client-side auth check will handle it properly
      console.error('Middleware auth error:', error)
    }
  }

  // Redirect authenticated users away from auth pages (but not from home page)
  if (isPublicPage && pathname !== '/' && (pathname === '/login' || pathname === '/signup')) {
    console.log('Checking auth redirect for:', pathname)
    try {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (token) {
        console.log('Redirecting authenticated user to dashboard')
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
  matcher: [
    '/dashboard/:path*', 
    '/modules/:path*', 
    '/login', 
    '/signup'
  ],
}


