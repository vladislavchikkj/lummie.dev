import { Metadata } from 'next'
import PricingView from './pricing-view'
import { APP_URL } from '@/app/constants'
import {
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: PAGE_SEO.pricing.title,
  description: PAGE_SEO.pricing.description,
  openGraph: createOpenGraphMetadata(PAGE_SEO.pricing.title),
  twitter: createTwitterMetadata(PAGE_SEO.pricing.title),
}

const PricingPage = () => {
  return <PricingView />
}

export default PricingPage
