import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { TRPCReactProvider } from '@/trpc/client'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { ClerkProvider } from '@clerk/nextjs'
import CookieConsent from '@/components/cookie-consent'
import { APP_NAME } from './constants'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DynamicNavbar } from '@/components/dynamic-navbar'
import { PWAProvider } from '@/components/pwa-provider'
import { SwipeGesturesProvider } from '@/components/swipe-gestures-provider'
import { ScrollbarGutterFix } from '@/components/scrollbar-gutter-fix'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'AI-powered development platform',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/logo.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-l.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  // Дополнительные мета-теги для предотвращения стандартного поведения браузера
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: APP_NAME,
    description: 'AI-powered development platform',
  },
  twitter: {
    card: 'summary',
    title: APP_NAME,
    description: 'AI-powered development platform',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  // Предотвращаем стандартные жесты браузера
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '',
        },
      }}
    >
      <TRPCReactProvider>
        <PWAProvider>
          <html lang="en" suppressHydrationWarning className="h-full">
            <head>
              {/* Дополнительные мета-теги для iOS PWA */}
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta
                name="apple-mobile-web-app-status-bar-style"
                content="default"
              />
              <meta name="apple-mobile-web-app-title" content="Lummie" />
              <meta name="mobile-web-app-capable" content="yes" />
              <meta name="format-detection" content="telephone=no" />

              {/* Apple Touch Icons */}
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="152x152"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="144x144"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="120x120"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="114x114"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="76x76"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="72x72"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="60x60"
                href="/apple-touch-icon.png"
              />
              <link
                rel="apple-touch-icon"
                sizes="57x57"
                href="/apple-touch-icon.png"
              />
            </head>
            <body
              className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            >
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Toaster />

                <SidebarProvider>
                  <SwipeGesturesProvider>
                    <ScrollbarGutterFix />
                    <DynamicNavbar />
                    <AppSidebar />
                    <main className="w-full ring-0">{children}</main>
                  </SwipeGesturesProvider>
                </SidebarProvider>
                <CookieConsent />
              </ThemeProvider>
            </body>
          </html>
        </PWAProvider>
      </TRPCReactProvider>
    </ClerkProvider>
  )
}
