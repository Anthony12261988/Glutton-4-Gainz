import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  // For now, this is a placeholder. Will be fully implemented in Phase 3 (Authentication)
  // when we add auth check logic with Supabase

  const { pathname } = request.nextUrl

  // Protected routes patterns
  const protectedRoutes = ['/app', '/coach', '/profile', '/stats', '/nutrition']
  const authRoutes = ['/login', '/signup', '/onboarding']

  // Check if the current path matches any protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // TODO: Phase 3 - Add actual session check here
  // For now, allow all routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons/* (PWA icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
}
