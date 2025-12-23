import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { TRPCReactProvider } from '@/trpc/client'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { ClerkProvider } from '@clerk/nextjs'
import CookieConsent from '@/components/cookie-consent'
import { SubscriptionDialogProvider } from '@/modules/subscriptions/hooks/use-subscription-dialog'
import { SubscriptionDialogWrapper } from './layout-subscription-dialog'
import { APP_NAME, APP_URL } from './constants'
import {
  SEO_TEXTS,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from './constants/seo'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DynamicNavbar } from '@/components/dynamic-navbar'
import { PWAProvider } from '@/components/pwa-provider'
import { SwipeGesturesProvider } from '@/components/swipe-gestures-provider'
import { ScrollbarGutterFix } from '@/components/scrollbar-gutter-fix'
import { GoogleAnalyticsComponent } from '@/components/google-analytics'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SEO_TEXTS.defaultTitle,
    template: SEO_TEXTS.titleTemplate,
  },
  description: SEO_TEXTS.defaultDescription,
  keywords: SEO_TEXTS.keywords,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  manifest: '/manifest.json',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: createOpenGraphMetadata(),
  twitter: createTwitterMetadata(),
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
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    description:
      'All-in-one AI assistant: Chat with AI, generate professional images, and build fully functional websites from text.',
    featureList: [
      'AI Chat Assistant',
      'Text to Website Generator',
      'AI Image Generator',
      'Code Generation',
      'React & Tailwind Builder',
    ],
    isSimilarTo: [
      { '@type': 'SoftwareApplication', name: 'ChatGPT' },
      { '@type': 'SoftwareApplication', name: 'ChatOn' },
      { '@type': 'SoftwareApplication', name: 'Grok' },
    ],
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '',
        },
      }}
      signInUrl="/"
      signUpUrl="/"
    >
      <TRPCReactProvider>
        <PWAProvider>
          <html lang="en" suppressHydrationWarning className="h-full">
            <head>
              {/* iOS PWA tags */}
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta
                name="apple-mobile-web-app-status-bar-style"
                content="default"
              />
              <meta name="apple-mobile-web-app-title" content="Lummie" />
              <meta name="mobile-web-app-capable" content="yes" />
              <meta name="format-detection" content="telephone=no" />

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
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />

              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Toaster />

                <SubscriptionDialogProvider>
                  <SidebarProvider>
                    <SwipeGesturesProvider>
                      <ScrollbarGutterFix />
                      <DynamicNavbar />
                      <AppSidebar />
                      <main className="w-full ring-0">{children}</main>
                    </SwipeGesturesProvider>
                  </SidebarProvider>
                  <SubscriptionDialogWrapper />
                  <CookieConsent />
                </SubscriptionDialogProvider>
              </ThemeProvider>
              <GoogleAnalyticsComponent />
            </body>
          </html>
        </PWAProvider>
      </TRPCReactProvider>
    </ClerkProvider>
  )
}
