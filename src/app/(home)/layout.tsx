import type { Metadata } from 'next'
import { Footer } from '@/modules/home/ui/components/footer'
import { APP_NAME, APP_URL } from '@/app/constants'
import {
  SEO_TEXTS,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'
import { Particles } from '@/components/ui/particles'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
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
    ],
  },

  openGraph: createOpenGraphMetadata(),
  twitter: createTwitterMetadata(),
}

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <main className="relative flex min-h-screen w-full flex-col">
      <div className="relative flex w-full flex-col items-start justify-center">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#ffffff"
          refresh
        />
        <div className="w-full">{children}</div>
      </div>
      <Footer />
    </main>
  )
}

export default Layout
