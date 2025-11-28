import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/app/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: 'Platform Rules',
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

export default function PlatformRulesPage() {
  return (
    <div className="dark:bg-background min-h-screen bg-gray-50 text-gray-800 antialiased transition-colors duration-300 dark:text-gray-100">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <header className="mb-16 text-center sm:mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Platform Rules <br /> (Acceptable Use Policy)
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            <strong className="font-semibold">
              Effective Date: October 2, 2025
            </strong>
          </p>
        </header>

        <main className="mt-6 space-y-6 rounded-xl bg-white p-8 text-lg leading-relaxed shadow-2xl shadow-indigo-100/50 dark:bg-zinc-800 dark:shadow-none">
          <div className="privacy-policy-content">
            <p>
              These Platform Rules ("Rules") govern the acceptable use of the
              lummie.dev Services and are incorporated by reference into our
              Terms of Service. By using the Services, you agree to abide by
              these Rules. Failure to comply with these Rules constitutes a
              material breach of the Terms of Service and may result in the
              immediate termination of your account without refund.
            </p>

            <h2 className="mt-10 mb-4 border-b border-gray-200 pb-2 text-3xl font-extrabold dark:border-gray-700">
              1. General Principles
            </h2>
            <p>
              The Services are intended for the creation of functional,
              non-malicious code and prototypes. You must use the Services in a
              manner that is lawful, ethical, and respects the rights of others.
            </p>

            <h2 className="mt-10 mb-4 border-b border-gray-200 pb-2 text-3xl font-extrabold dark:border-gray-700">
              2. Prohibited Uses and Content Generation
            </h2>
            <p>
              You may NOT use the Services to generate or facilitate the
              creation of any content or code that:
            </p>

            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Illegal Activity:
                </strong>{' '}
                Violates any applicable local, state, national, or international
                law or regulation.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Malicious Code:
                </strong>{' '}
                Creates, distributes, or promotes viruses, malware, ransomware,
                denial-of-service attack scripts, or any other code designed to
                disrupt, damage, or gain unauthorized access to any system,
                data, or personal information.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Hate Speech and Harassment:
                </strong>{' '}
                Promotes or facilitates discrimination, harassment, violence, or
                hate speech against individuals or groups based on race,
                ethnicity, religion, disability, gender, age, or sexual
                orientation.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Exploitation of Minors:
                </strong>{' '}
                Generates content or code related to the exploitation or abuse
                of children, including child sexual abuse material (CSAM).
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Intellectual Property Infringement:
                </strong>{' '}
                Violates the copyright, patent, trademark, trade secret, or
                other proprietary rights of any third party.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Phishing and Spam:
                </strong>{' '}
                Facilitates phishing schemes, spam campaigns, or any form of
                unsolicited commercial communication.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Privacy Violation:
                </strong>{' '}
                Collects, stores, or transmits sensitive personal information
                (PII, financial data) without appropriate legal bases or
                security measures.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Deceptive Practices:
                </strong>{' '}
                Is false, fraudulent, or misleading (e.g., generating code for
                fake identities or scams).
              </li>
            </ul>

            <h2 className="mt-10 mb-4 border-b border-gray-200 pb-2 text-3xl font-extrabold dark:border-gray-700">
              3. Prohibited Service Abuse
            </h2>
            <p>
              You may NOT misuse the technical functionality of the Services in
              any way, including:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Bypassing Limits:
                </strong>{' '}
                Attempting to circumvent usage limits, rate limits, or token
                restrictions imposed by your subscription plan.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Unauthorized Access:
                </strong>{' '}
                Accessing or attempting to access areas of the Service for which
                you have not been granted explicit permission.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Reverse Engineering:
                </strong>{' '}
                Attempting to decompile, disassemble, or reverse engineer the
                underlying AI models or software infrastructure of the Services.
              </li>
              <li>
                <strong className="font-extrabold text-gray-900 dark:text-gray-50">
                  Account Misuse:
                </strong>{' '}
                Selling, sharing, or transferring your account or login
                credentials to others outside the permitted scope of your
                subscription.
              </li>
            </ul>

            <h2 className="mt-10 mb-4 border-b border-gray-200 pb-2 text-3xl font-extrabold dark:border-gray-700">
              4. Enforcement and Reporting
            </h2>
            <p>
              The Company reserves the right to review any Content or Generated
              Code for compliance with these Rules. We may, at our sole
              discretion, take any action we deem appropriate, including:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Removing or blocking access to prohibited Content or Generated
                Code.
              </li>
              <li>Issuing warnings.</li>
              <li>
                Suspending or permanently terminating your account, potentially
                without refund, as outlined in the
                <a
                  href="/terms"
                  className="ms-2 font-semibold text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Terms of Service
                </a>
                .
              </li>
            </ul>
            <p>
              If you encounter any content or activity on the Services that you
              believe violates these Rules, please report it immediately to:
              <a
                href="mailto:legal@lummie.dev"
                className="font-semibold text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                legal@lummie.dev
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
