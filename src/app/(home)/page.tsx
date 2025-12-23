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
      'AI Chat Assistant',
      'Text to Website Generator',
      'AI Image Generator',
      'Code Generation',
      'AI Content Generator',
      'Multimodal AI Processing',
    ],
    screenshot: `${APP_URL}/og-image.png`,
    softwareVersion: process.env.npm_package_version || '1.0',
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    creator: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL,
    },
    keywords: SEO_TEXTS.keywords.join(', '),
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
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

      {/* Основной контент (First View) */}
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
            <div className="min-h-[30vh]" />
          )}
        </div>
      </section>

      {/* SAFE SEO SECTION 
        Сделано максимально незаметно (мелкий серый шрифт внизу), 
        но полностью легально для Google.
      */}
      <section className="border-t border-neutral-200 bg-neutral-50/50 py-16 dark:border-neutral-800 dark:bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-5 text-sm text-neutral-400 dark:text-neutral-500">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: Core Value */}
            <div className="space-y-3">
              <h2 className="font-semibold text-neutral-600 dark:text-neutral-300">
                Advanced AI Platform
              </h2>
              <p>
                {APP_NAME} represents the next evolution in AI assistance.
                Unlike a standard <strong>ChatGPT alternative</strong>, our
                platform acts as a comprehensive
                <strong>AI App Builder</strong>. We combine state-of-the-art
                LLMs with specialized rendering engines to allow users to
                generate not just text, but fully functional web applications
                and professional visual assets.
              </p>
            </div>

            {/* Column 2: Features (Keywords heavy) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-600 dark:text-neutral-300">
                Multimodal Capabilities
              </h3>
              <p>
                Our <strong>AI Image Generator</strong> creates high-fidelity
                visuals from natural language, while our{' '}
                <strong>Text to Website</strong> engine transforms prompts into
                production-ready React code. Whether you need an intelligent{' '}
                <strong>AI Writer</strong> for content creation or a
                sophisticated coding companion, {APP_NAME} unifies these tools
                into one seamless interface.
              </p>
            </div>

            {/* Column 3: Comparison & Tech */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-600 dark:text-neutral-300">
                Why Lummie?
              </h3>
              <p>
                Designed for efficiency, {APP_NAME} serves as a powerful{' '}
                <strong>ChatOn alternative</strong> and
                <strong>Jasper alternative</strong>. By integrating{' '}
                <strong>text generation</strong>,<strong>code building</strong>,
                and visual design, we empower creators to go from idea to
                deployed application in minutes. Experience the future of
                generative AI today.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-xs opacity-60">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            Generated content is powered by advanced artificial intelligence
            models.
          </div>
        </div>
      </section>
    </>
  )
}

export default Page
