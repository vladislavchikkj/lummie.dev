import { APP_URL } from '@/app/constants'
import {
  PAGE_SEO,
  createOpenGraphMetadata,
  createTwitterMetadata,
} from '@/app/constants/seo'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  KeyRound,
  Headset,
  Scaling,
  BarChart3,
  ClipboardCheck,
  ArrowRight,
  Server,
  Code,
  MessageCircle,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: PAGE_SEO.enterprise.title,
  description: PAGE_SEO.enterprise.description,
  openGraph: createOpenGraphMetadata(PAGE_SEO.enterprise.title),
  twitter: createTwitterMetadata(PAGE_SEO.enterprise.title),
}

const enterpriseFeatures = [
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: 'Enterprise-Grade Security',
    description:
      'Robust security controls and compliance measures to protect your data.',
  },
  {
    icon: <KeyRound className="h-7 w-7" />,
    title: 'SAML SSO & SCIM',
    description:
      'Centralized access management with single sign-on and automated user provisioning.',
  },
  {
    icon: <Headset className="h-7 w-7" />,
    title: '24/7 Priority Support',
    description: 'Dedicated support from our experts, available anytime.',
  },
  {
    icon: <Scaling className="h-7 w-7" />,
    title: 'Scalable Infrastructure',
    description: 'Performance that grows with your team, no matter the size.',
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Advanced Analytics',
    description: 'Deep insights into your team’s workflows and performance.',
  },
  {
    icon: <ClipboardCheck className="h-7 w-7" />,
    title: 'Compliance & Audit',
    description: 'Audit logs and tools to meet industry standards.',
  },
  {
    icon: <Server className="h-7 w-7" />,
    title: 'Uptime Guarantee',
    description: 'Financially backed SLA for maximum service availability.',
  },
  {
    icon: <Code className="h-7 w-7" />,
    title: 'AI-Powered App Generation',
    description:
      'Generate custom applications effortlessly using advanced AI tools.',
  },
  {
    icon: <MessageCircle className="h-7 w-7" />,
    title: 'Intelligent Chatbot',
    description: 'Enhance user engagement with a smart, AI-driven chatbot.',
  },
]

const AuroraBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="relative isolate w-full bg-white transition-colors duration-500 dark:bg-neutral-950">
    <div
      className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      aria-hidden="true"
    >
      <div
        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] dark:opacity-20"
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
      />
    </div>
    {children}
    <div
      className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      aria-hidden="true"
    >
      <div
        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#80ff95] to-[#899cfc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] dark:opacity-20"
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
      />
    </div>
  </div>
)

const EnterprisePage = () => {
  return (
    <AuroraBackground>
      <section className="overflow-hidden pt-36 pb-24 text-center md:pt-48 md:pb-32">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
            The Intelligent Platform
            <br />
            <span className="from-primary bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">
              for Modern Enterprises
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-neutral-600 md:text-xl dark:text-neutral-400">
            Build and scale applications effortlessly with Lummie’s AI-powered
            app generation and intelligent chatbot solutions.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button
              size="lg"
              className="group rounded-full bg-neutral-900 px-6 text-white transition-transform duration-300 ease-in-out hover:scale-105 dark:bg-white dark:text-black"
              asChild
            >
              <Link href="/contact/sales">
                Contact Sales
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-neutral-300 px-6 backdrop-blur-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-white/50 dark:border-neutral-700 dark:hover:bg-black/20"
              asChild
            >
              <Link href="/learn-more">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
              A Platform Built for Innovation
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Lummie Enterprise empowers teams with AI-driven tools for app
              development and intelligent chatbot solutions.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {enterpriseFeatures.map((feature, i) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-black/10 bg-white/40 p-6 shadow-2xl ring-1 shadow-violet-600/5 ring-black/5 backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-600/10 dark:border-white/10 dark:bg-black/20 dark:shadow-violet-400/5 dark:hover:shadow-violet-400/10"
              >
                <div className="to-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-black/10 bg-white/40 p-8 shadow-2xl ring-1 shadow-violet-600/10 ring-black/5 backdrop-blur-lg md:p-12 dark:border-white/10 dark:bg-black/20 dark:shadow-violet-400/10">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Connect with our team to create a tailored plan for your
              enterprise.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="group rounded-full bg-neutral-900 px-6 text-white transition-transform duration-300 ease-in-out hover:scale-105 dark:bg-white dark:text-black"
                asChild
              >
                <Link href="/contact/sales">
                  Start the Conversation
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AuroraBackground>
  )
}

export default EnterprisePage
