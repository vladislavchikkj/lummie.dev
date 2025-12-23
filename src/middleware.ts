import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api(.*)',
  '/pricing(.*)',
  // info pages
  '/privacy',
  '/terms',
  '/about',
  '/contact',
  '/enterprise',
  '/resources',
  '/cookie',
  '/platform-rules',
  // PWA files
  '/manifest.json',
  '/sw.js',

  '/robots.txt',
  '/sitemap.xml',

  // Clerk routes
  '/profile(.*)',
  '/settings(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
