import { Metadata } from 'next'
import PricingView from './pricing-view'
import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/app/constants'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: 'Pricing',
  description: APP_DESCRIPTION,

  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `Preview image for ${APP_NAME}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
  },
}

const PricingPage = () => {
  return <PricingView />
}

export default PricingPage
