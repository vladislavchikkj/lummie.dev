// File: src/app/(home)/(info)/resources/page.tsx

import { APP_URL } from '@/app/constants'
import {
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  BookText,
  Code2,
  Component,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: PAGE_SEO.resources.title,
  description: PAGE_SEO.resources.description,
  openGraph: createOpenGraphMetadata(PAGE_SEO.resources.title),
  twitter: createTwitterMetadata(PAGE_SEO.resources.title),
}

// A focused and simplified list of main resources.
const mainResources = [
  {
    icon: <BookText className="h-6 w-6" />,
    title: 'Documentation',
    description: 'Complete API reference and technical guides.',
    href: '/docs',
  },
  {
    icon: <Component className="h-6 w-6" />,
    title: 'Prompt Library',
    description:
      'Curated examples of prompts for generating complex applications.',
    href: '/prompt-library',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community on Discord',
    description: 'Join other developers to connect and share knowledge.',
    href: 'https://discord.gg/HZwrAdjQEk', // Your Discord link
  },
]

// The AuroraBackground component provides a subtle, modern visual effect.
const AuroraBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="relative isolate w-full bg-white transition-colors duration-500 dark:bg-black">
    <div
      className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      aria-hidden="true"
    >
      <div
        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] dark:opacity-10"
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
      />
    </div>
    {children}
  </div>
)

// The main page component
const ResourcesPage = () => {
  return (
    <AuroraBackground>
      {/* The standard container is used for padding, with a max-width wrapper inside */}
      <div className="container mx-auto px-4">
        {/* NEW: This div constrains the content width for a more focused layout */}
        <div className="mx-auto max-w-6xl">
          {/* Section 1: Hero */}
          <section className="pt-36 pb-24 text-center md:pt-48 md:pb-32">
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl dark:text-white">
              Developer{' '}
              <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                Resources
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Everything you need to build web applications with AI. From quick
              starts to advanced techniques.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Button
                size="lg"
                className="group rounded-full bg-neutral-900 px-6 text-white transition-transform duration-300 ease-in-out hover:scale-105 dark:bg-white dark:text-black"
                asChild
              >
                <Link href="/docs">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Section 2: Inline "Quick Start" Tutorial */}
          <section className="py-16 sm:py-24">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
                Your First App in 60 Seconds
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                Follow these three simple steps to generate and launch your
                first web application.
              </p>
            </div>

            <div className="relative rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-8 backdrop-blur-xl md:p-12 dark:border-neutral-800/80 dark:bg-neutral-900/50">
              <div className="grid gap-12 md:grid-cols-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
                    1. Describe Your Idea
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Start with a plain text description. The more detailed the
                    prompt, the more accurate the result.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
                    2. Generate the Code
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Our AI will analyze your request and create a complete
                    codebase using React, Vue, or Svelte.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
                    3. Launch the App
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Download the archive, install dependencies, and run the
                    project with a single command.
                  </p>
                </div>
              </div>

              {/* Code Example */}
              <div className="mt-12 rounded-xl bg-black/80 p-4 font-mono text-sm text-white">
                <p className="text-violet-400"># Example Prompt:</p>
                <p className="text-neutral-300">
                  &quot;Create a simple to-do list application. The user should
                  be able to add and remove tasks. Use React and Tailwind CSS
                  for styling.&quot;
                </p>
                <p className="mt-4 text-violet-400"># Command to run:</p>
                <p className="text-neutral-300">
                  <span className="text-gray-500">$</span> npm install
                  &amp;&amp; npm run dev
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Main Resources */}
          <section className="py-16 sm:py-24">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-neutral-900 sm:text-5xl dark:text-white">
                Explore Resources
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                Dive into our documentation, explore best practices, or join our
                community of builders.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mainResources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  target={resource.href.startsWith('http') ? '_blank' : '_self'}
                  rel={
                    resource.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : ''
                  }
                  className="group relative block rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-violet-300 hover:bg-white/50 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-violet-700/50 dark:hover:bg-neutral-900"
                >
                  <div className="mb-4 text-violet-500 dark:text-violet-400">
                    {resource.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {resource.title}
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    {resource.description}
                  </p>
                  <div className="absolute top-6 right-6 text-neutral-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-neutral-600">
                    <ArrowRight />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AuroraBackground>
  )
}

export default ResourcesPage
