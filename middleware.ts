import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to get user role from cookies
function getUserRole(request: NextRequest): number | null {
  const userData = request.cookies.get('user_data')?.value
  if (!userData) return null
  
  try {
    const user = JSON.parse(userData)
    return user.role_id || null
  } catch {
    return null
  }
}

// Helper function to check if session has timed out (30 minutes)
function isSessionExpired(request: NextRequest): boolean {
  const lastActivity = request.cookies.get('last_activity')?.value
  if (!lastActivity) return false // Don't expire if no activity timestamp (new session)
  
  const lastActivityTime = parseInt(lastActivity)
  const currentTime = Date.now()
  const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
  
  return (currentTime - lastActivityTime) > thirtyMinutes
}

// Role-based route permissions
const routePermissions: { [key: string]: number[] } = {
  '/dashboard': [1, 2, 3], // student, instructor, admin
  '/courses': [1, 2, 3],
  '/assignments': [1, 2, 3],
  '/users': [2, 3], // instructor, admin only
  '/admin': [3], // admin only
  '/profile': [1, 2, 3],
  '/analytics': [2, 3], // instructor, admin only
  '/settings': [3], // admin only
  '/materials': [1, 2, 3],
  '/enrollments': [2, 3], // instructor, admin only
  '/grading': [2, 3], // instructor, admin only
}

// Helper function to check if user has permission for route
function hasRoutePermission(pathname: string, userRole: number): boolean {
  // Check for exact path match first
  if (routePermissions[pathname]) {
    return routePermissions[pathname].includes(userRole)
  }
  
  // Check for parent path permissions
  for (const route in routePermissions) {
    if (pathname.startsWith(route + '/')) {
      return routePermissions[route].includes(userRole)
    }
  }
  
  // Default: allow access if no specific restrictions
  return true
}

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value
  const userData = request.cookies.get('user_data')?.value
  const { pathname } = request.nextUrl

  // Allow access to API routes, static files, and public pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/locales') ||
    pathname === '/' ||
    pathname.startsWith('/test') // Allow test routes
  ) {
    return NextResponse.next()
  }

  // Check authentication - need both token and user data
  const isAuthenticated = !!(authToken && userData)

  // Redirect authenticated users from login/register pages to dashboard
  if (isAuthenticated && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users from protected routes to login
  if (!isAuthenticated && !(pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For authenticated users, check session timeout and permissions
  if (isAuthenticated) {
    if (isSessionExpired(request)) {
      // Clear auth cookies and redirect to login
      const response = NextResponse.redirect(new URL('/login?error=session_expired', request.url))
      response.cookies.delete('auth_token')
      response.cookies.delete('user_id')
      response.cookies.delete('user_data')
      response.cookies.delete('last_activity')
      return response
    }

    // Check role-based permissions
    const userRole = getUserRole(request)
    if (userRole && !hasRoutePermission(pathname, userRole)) {
      // Redirect to dashboard if user doesn't have permission
      return NextResponse.redirect(new URL('/dashboard?error=access_denied', request.url))
    }

    // Update last activity timestamp
    const response = NextResponse.next()
    response.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Match all paths except API routes, static files, and favicon
  ],
}
