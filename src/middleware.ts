import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = process.env.WAITLIST_BYPASS_TOKEN || 'raegan-2026-builder'
  const accessParam = request.nextUrl.searchParams.get('access')
  const cookie = request.cookies.get('casa_access')?.value
  const { pathname } = request.nextUrl

  // Allow bypass via URL param — set cookie and redirect to workspace
  if (accessParam === token) {
    const response = NextResponse.redirect(new URL('/select-role', request.url))
    response.cookies.set('casa_access', token, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })
    return response
  }

  // These routes are ALWAYS public — no gate ever
  const alwaysPublic = [
    '/',
    '/waitlist',
  ]

  if (alwaysPublic.includes(pathname)) {
    return NextResponse.next()
  }

  // Workspace and app routes require bypass token
  const requiresAccess = pathname.startsWith('/workspace') ||
                         pathname.startsWith('/select-role') ||
                         pathname.startsWith('/property')

  if (requiresAccess) {
    if (cookie !== token) {
      return NextResponse.redirect(new URL('/waitlist', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
}
