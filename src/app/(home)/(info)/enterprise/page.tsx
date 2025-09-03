import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/app/constants'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
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

  title: 'Enterprise',
  description: APP_DESCRIPTION,

  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `Preview image for ${APP_NAME}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
  },
}

const enterpriseFeatures = [
  {
    icon: <ShieldCheck className="text-primary h-8 w-8" />,
    title: 'Enterprise-Grade Security',
    description:
      'Robust security controls and compliance measures to protect your data.',
  },
  {
    icon: <KeyRound className="text-primary h-8 w-8" />,
    title: 'SAML SSO & SCIM',
    description:
      'Centralized access management with single sign-on and automated user provisioning.',
  },
  {
    icon: <Headset className="text-primary h-8 w-8" />,
    title: '24/7 Priority Support',
    description: 'Dedicated support from our experts, available anytime.',
  },
  {
    icon: <Scaling className="text-primary h-8 w-8" />,
    title: 'Scalable Infrastructure',
    description: 'Performance that grows with your team, no matter the size.',
  },
  {
    icon: <BarChart3 className="text-primary h-8 w-8" />,
    title: 'Advanced Analytics',
    description: 'Deep insights into your team’s workflows and performance.',
  },
  {
    icon: <ClipboardCheck className="text-primary h-8 w-8" />,
    title: 'Compliance & Audit',
    description: 'Audit logs and tools to meet industry standards.',
  },
  {
    icon: <Server className="text-primary h-8 w-8" />,
    title: 'Uptime Guarantee',
    description: 'Financially backed SLA for maximum service availability.',
  },
  {
    icon: <Code className="text-primary h-8 w-8" />,
    title: 'AI-Powered App Generation',
    description:
      'Generate custom applications effortlessly using advanced AI tools.',
  },
  {
    icon: <MessageCircle className="text-primary h-8 w-8" />,
    title: 'Intelligent Chatbot',
    description: 'Enhance user engagement with a smart, AI-driven chatbot.',
  },
]

const EnterprisePage = () => {
  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <section className="from-background relative bg-gradient-to-b to-neutral-50 py-24 text-center md:py-32 lg:py-40 dark:to-neutral-900">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_500px_at_50%_200px,#a78bfa22,transparent)]" />
        <div className="z-10 container mx-auto max-w-5xl px-4">
          <div className="z-5">
            <BackgroundRippleEffect />
          </div>
          <h1 className="from-primary relative z-10 bg-gradient-to-r to-violet-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl">
            Lummie for Enterprises
          </h1>
          <p className="text-muted-foreground relative z-10 mx-auto mt-6 max-w-3xl text-lg md:text-xl">
            Build and scale applications effortlessly with Lummie’s AI-powered
            app generation and intelligent chatbot solutions.
          </p>
          <div className="relative z-10 mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              asChild
            >
              <Link href="/contact/sales">
                Contact Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-neutral-200 px-6 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              asChild
            >
              <Link href="/learn-more">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 py-20 md:py-28 dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              A Platform Built for Innovation
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Lummie Enterprise empowers teams with AI-driven tools for app
              development and intelligent chatbot solutions.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enterpriseFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-background hover:border-primary/50 rounded-2xl border border-neutral-200 p-6 transition-all hover:shadow-xl dark:border-neutral-700"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="from-background bg-gradient-to-b to-neutral-50 py-20 md:py-28 dark:to-neutral-900">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Connect with our team to create a tailored plan for your enterprise.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              asChild
            >
              <Link href="/contact/sales">
                Start the Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EnterprisePage
