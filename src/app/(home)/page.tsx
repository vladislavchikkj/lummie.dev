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

  // Обновленный JSON-LD без упоминания конкурентов в sameAs или description
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    alternateName: ['Lumi', 'Lumm', 'Lumi AI', 'Lumm AI', 'Lummie AI'],
    description: SEO_TEXTS.defaultDescription,
    url: APP_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    featureList: [
      'Advanced AI Chat Interface',
      'Text-to-Website Generation',
      'Professional AI Image Synthesis',
      'React & Tailwind Code Export',
      'Full-Stack App Prototyping',
      'Multimodal AI Assistant',
    ],
    screenshot: `${APP_URL}/og-image.png`,
    softwareVersion: process.env.npm_package_version || '1.0',
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    creator: {
      '@type': 'Organization',
      name: APP_NAME,
      alternateName: ['Lumi', 'Lumm'],
      url: APP_URL,
    },
    keywords: SEO_TEXTS.keywords.join(', '),
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    alternateName: ['Lumi', 'Lumm', 'Lumi AI', 'Lumm AI', 'Lummie AI'],
    url: APP_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${APP_URL}/logo.svg`,
    },
    description: SEO_TEXTS.defaultDescription,
    foundingDate: '2025',
    sameAs: [],
  }

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    alternateName: ['Lumi', 'Lumm', 'Lumi AI', 'Lumm AI', 'Lummie AI'],
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

      {/* Hero Section */}
      <section className="pt-40 pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-5">
          <Logo width={75} height={75} className="relative z-10 mb-2" />
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-6xl dark:text-neutral-100">
            {APP_NAME}
          </h1>

          <h2 className="relative z-10 mx-auto mt-4 mb-8 min-h-[48px] max-w-xl text-center text-neutral-800 dark:text-neutral-500">
            <TextGenerateEffect words={APP_DESCRIPTION} />
          </h2>

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
            <div className="min-h-[30vh]" />
          )}
        </div>
      </section>

      {/* SEO OPTIMIZED SECTION - Hidden visually but accessible to search engines */}
      <section className="sr-only">
        <div>
          <h2>About {APP_NAME}</h2>
          <p>
            {APP_NAME} is your AI assistant for everyday use. Chat with advanced
            AI, generate stunning images, write professional content, and build
            websites instantly.
          </p>
          <p>
            {APP_NAME} (also known as Lumi or Lumm) is an advanced AI-powered
            development platform designed to bridge the gap between imagination
            and reality. We provide a unified environment where users can
            leverage multimodal artificial intelligence to generate text, code,
            and visuals simultaneously.
          </p>
          <p>
            Our proprietary engine specializes in text-to-website generation,
            allowing you to build fully functional web applications using modern
            stacks like React, Tailwind CSS, and Next.js simply by describing
            them. Combined with our professional AI image generator, {APP_NAME}{' '}
            automates the entire frontend prototyping process, delivering
            production-ready assets in seconds.
          </p>
          <p>
            Eliminate the friction of switching between multiple tools.{' '}
            {APP_NAME} serves as your intelligent coding assistant, creative
            designer, and technical writer in one interface. Whether you are
            building a startup MVP, generating marketing assets, or debugging
            complex logic, our all-in-one AI platform significantly reduces
            development time and enhances creative output.
          </p>
        </div>
      </section>
    </>
  )
}

export default Page
