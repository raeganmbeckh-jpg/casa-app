import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = process.env.WAITLIST_BYPASS_TOKEN || 'raegan-2026-builder'
  const accessParam = request.nextUrl.searchParams.get('access')
  const cookie = request.cookies.get('casa_access')?.value

  // Allow bypass via URL param — set cookie and redirect
  if (accessParam === token) {
    const response = NextResponse.redirect(new URL('/select-role', request.url))
    response.cookies.set('casa_access', token, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })
    return response
  }

  // Allow if cookie is set
  if (cookie === token) {
    return NextResponse.next()
  }

  // Block all routes except waitlist and static files
  const { pathname } = request.nextUrl
  const isPublic = pathname === '/waitlist' ||
                   pathname.startsWith('/_next') ||
                   pathname.startsWith('/api') ||
                   pathname.includes('.')

  if (!isPublic) {
    return NextResponse.redirect(new URL('/waitlist', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
