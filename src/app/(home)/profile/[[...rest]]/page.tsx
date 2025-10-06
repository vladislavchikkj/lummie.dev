import { APP_NAME, APP_URL } from '@/app/constants'
import { Metadata } from 'next'
import { ProfileClient } from './profile-client'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: 'User Profile',
  description:
    'Manage your profile, update personal information, and configure account settings.',

  openGraph: {
    title: `${APP_NAME} | User Profile`,
    description:
      'Manage your profile, update personal information, and configure account settings.',
    url: `${APP_URL}/profile`,
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `User Profile - ${APP_NAME}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} | User Profile`,
    description:
      'Manage your profile, update personal information, and configure account settings.',
    images: ['/og-image.png'],
  },
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
