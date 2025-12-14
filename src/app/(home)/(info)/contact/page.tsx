import { Metadata } from 'next'
import { APP_URL } from '@/app/constants'
import {
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'
import ContactView from './contact-view'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: PAGE_SEO.contact.title,
  description: PAGE_SEO.contact.description,
  openGraph: createOpenGraphMetadata(PAGE_SEO.contact.title),
  twitter: createTwitterMetadata(PAGE_SEO.contact.title),
}

const ContactPage = () => {
  return <ContactView />
}

export default ContactPage
