import { NextResponse } from 'next/server'
import { comingSoonHtml } from './coming-soon'

// Gate the whole site behind a "Coming Soon" page.
// Set COMING_SOON=false in the environment to take the site live again.
const COMING_SOON = process.env.COMING_SOON !== 'false'

export function middleware(request) {
  const host = request.headers.get('host')

  // Only redirect www in production
  if (process.env.NODE_ENV === 'production' && host?.startsWith('www.')) {
    const newHost = host.replace('www.', '')
    const url = request.nextUrl.clone()
    url.host = newHost
    return NextResponse.redirect(url, 301)
  }

  if (COMING_SOON) {
    return new NextResponse(comingSoonHtml, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, must-revalidate',
        'retry-after': '86400',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, the service worker and
    // any file in /public (anything with a file extension).
    '/((?!api|_next/static|_next/image|favicon.ico|sw\\.js|workbox-.*|manifest\\.json|.*\\..*).*)',
  ],
}
