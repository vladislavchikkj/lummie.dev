import { Metadata } from 'next'
import { APP_URL } from '@/app/constants'
import {
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'
import { PricingPageClient } from './pricing-page-client'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: PAGE_SEO.pricing.title,
  description: PAGE_SEO.pricing.description,
  openGraph: createOpenGraphMetadata(PAGE_SEO.pricing.title),
  twitter: createTwitterMetadata(PAGE_SEO.pricing.title),
}

const PricingPage = () => {
  return <PricingPageClient />
}

export default PricingPage
