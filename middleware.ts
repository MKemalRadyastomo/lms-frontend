import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('token') // Assuming 'token' is your auth cookie
  const { pathname } = request.nextUrl

  // Allow access to API routes, static files, and public pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/locales') || // Allow access to i18n translation files
    pathname === '/' // Allow access to home page
  ) {
    return NextResponse.next()
  }

  // Redirect authenticated users from login/register pages to dashboard
  if (isAuthenticated && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users from protected routes to login
  if (!isAuthenticated && !(pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Match all paths except API routes, static files, and favicon
  ],
}
