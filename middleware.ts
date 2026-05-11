import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/services',
  '/service-inquiry',
  '/find-care',
]

function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('auth_token')?.value

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?)$/)

  // Unauthenticated user trying to access protected route
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (token) {
    const payload = decodeJwtPayload(token)

    // Redirect logged-in users away from login page
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Role-based route protection
    if (payload?.role) {
      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      if (pathname.startsWith('/scheduling') && payload.role !== 'sitter') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      if (pathname.startsWith('/reports') && !['sitter', 'admin'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon).*)'],
}
