import { ProjectForm } from '@/modules/home/ui/components/project-form'
import { APP_DESCRIPTION, APP_NAME, APP_URL } from '../constants'
import {
  SEO_TEXTS,
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '../constants/seo'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { ProjectsList } from '@/modules/home/ui/components/projects-list'
import Logo from '@/components/ui/logo'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/trpc/server'
import { auth } from '@clerk/nextjs/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: APP_NAME,
  },
  description: PAGE_SEO.home.description,
  keywords: SEO_TEXTS.keywords,
  openGraph: createOpenGraphMetadata(),
  twitter: createTwitterMetadata(),
  alternates: {
    canonical: APP_URL,
  },
}

const Page = async () => {
  const { userId } = await auth()
  const queryClient = getQueryClient()

  if (userId) {
    await queryClient.prefetchQuery(
      trpc.projects.getManyWithPreview.queryOptions()
    )
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
    featureList: [
      'AI-Powered Code Generation',
      'Full-Stack Application Building',
      'Automated Development Workflow',
      'Secure Cloud Sandbox',
      'Project Management Dashboard',
    ],
    screenshot: `${APP_URL}/og-image.png`,
    softwareVersion: '1.0',
    datePublished: '2025-01-01',
    creator: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL,
    },
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: APP_URL,
    logo: `${APP_URL}/logo.svg`,
    description: APP_DESCRIPTION,
    sameAs: [
      // Add your social media links here when available
    ],
  }

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: APP_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <section className="pt-40 pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-5">
          <Logo width={75} height={75} className="relative z-10 mb-2" />
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-6xl dark:text-neutral-100">
            {APP_NAME}
          </h1>

          <div className="relative z-10 mx-auto mt-4 mb-8 min-h-[48px] max-w-xl text-center text-neutral-800 dark:text-neutral-500">
            <TextGenerateEffect words={APP_DESCRIPTION} />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-3xl">
            <ProjectForm />
          </div>

          {userId ? (
            <HydrationBoundary state={dehydrate(queryClient)}>
              <div className="relative z-10 mx-auto mt-48 min-h-[400px] w-full max-w-7xl">
                <ProjectsList />
              </div>
            </HydrationBoundary>
          ) : (
            <div className="min-h-[50vh]" />
          )}
        </div>
      </section>
    </>
  )
}

export default Page
