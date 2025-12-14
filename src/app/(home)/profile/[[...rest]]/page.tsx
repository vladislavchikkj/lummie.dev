import { APP_URL } from '@/app/constants'
import {
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'
import { Metadata } from 'next'
import { ProfileClient } from './profile-client'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: PAGE_SEO.profile.title,
  description: PAGE_SEO.profile.description,
  openGraph: createOpenGraphMetadata(
    PAGE_SEO.profile.title,
    PAGE_SEO.profile.description,
    `${APP_URL}/profile`
  ),
  twitter: createTwitterMetadata(
    PAGE_SEO.profile.title,
    PAGE_SEO.profile.description
  ),
}

export default function ProfilePage() {
  return (
    <div className="bg-white text-zinc-800 antialiased dark:bg-black dark:text-zinc-200">
      <div className="container mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32">
        <main className="bg-muted mx-auto w-fit max-w-4xl rounded-2xl">
          <ProfileClient />
        </main>
      </div>
    </div>
  )
}
