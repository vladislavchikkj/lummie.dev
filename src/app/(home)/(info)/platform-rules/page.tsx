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
    <div className="bg-background text-foreground antialiased">
      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36">
        <header className="text-center">
          <h1>Platform Rules (Acceptable Use Policy)</h1>
          <p><strong>Effective Date: October 2, 2025</strong></p>
        </header>

        <main
          className="prose prose-neutral dark:prose-invert prose-lg prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 mt-16 max-w-none">
          <div className="privacy-policy-content">
            <p>These Platform Rules ("Rules") govern the acceptable use of the lummie.dev Services and are incorporated
              by
              reference into our Terms of Service. By using the Services, you agree to abide by these Rules. Failure to
              comply with these Rules constitutes a material breach of the Terms of Service and may result in the
              immediate termination of your account without refund.</p>

            <h2 >1. General Principles</h2>
            <p>The Services are intended for the creation of functional, non-malicious code and prototypes. You must use
              the Services in a manner that is lawful, ethical, and respects the rights of others.</p>

            <h2>2. Prohibited Uses and Content Generation</h2>
            <p>You may NOT use the Services to generate or facilitate the creation of any content or code that:</p>
            <ul>
              <li><strong>Illegal Activity:</strong> Violates any applicable local, state, national, or international
                law or regulation.
              </li>
              <li><strong>Malicious Code:</strong> Creates, distributes, or promotes viruses, malware, ransomware,
                denial-of-service attack scripts, or any other code designed to disrupt, damage, or gain unauthorized
                access to any system, data, or personal information.
              </li>
              <li><strong>Hate Speech and Harassment:</strong> Promotes or facilitates discrimination, harassment,
                violence, or hate speech against individuals or groups based on race, ethnicity, religion, disability,
                gender, age, or sexual orientation.
              </li>
              <li><strong>Exploitation of Minors:</strong> Generates content or code related to the exploitation or
                abuse of children, including child sexual abuse material (CSAM).
              </li>
              <li><strong>Intellectual Property Infringement:</strong> Violates the copyright, patent, trademark, trade
                secret, or other proprietary rights of any third party.
              </li>
              <li><strong>Phishing and Spam:</strong> Facilitates phishing schemes, spam campaigns, or any form of
                unsolicited commercial communication.
              </li>
              <li><strong>Privacy Violation:</strong> Collects, stores, or transmits sensitive personal information
                (PII, financial data) without appropriate legal bases or security measures.
              </li>
              <li><strong>Deceptive Practices:</strong> Is false, fraudulent, or misleading (e.g., generating code for
                fake identities or scams).
              </li>
            </ul>

            <h2>3. Prohibited Service Abuse</h2>
            <p>You may NOT misuse the technical functionality of the Services in any way, including:</p>
            <ul>
              <li><strong>Bypassing Limits:</strong> Attempting to circumvent usage limits, rate limits, or token
                restrictions imposed by your subscription plan.
              </li>
              <li><strong>Unauthorized Access:</strong> Accessing or attempting to access areas of the Service for which
                you have not been granted explicit permission.
              </li>
              <li><strong>Reverse Engineering:</strong> Attempting to decompile, disassemble, or reverse engineer the
                underlying AI models or software infrastructure of the Services.
              </li>
              <li><strong>Account Misuse:</strong> Selling, sharing, or transferring your account or login credentials
                to others outside the permitted scope of your subscription.
              </li>
            </ul>

            <h2>4. Enforcement and Reporting</h2>
            <p>The Company reserves the right to review any Content or Generated Code for compliance with these Rules.
              We may, at our sole discretion, take any action we deem appropriate, including:</p>
            <ul>
              <li>Removing or blocking access to prohibited Content or Generated Code.</li>
              <li>Issuing warnings.</li>
              <li>Suspending or permanently terminating your account, potentially without refund, as outlined in the
                Terms of Service.
              </li>
            </ul>
            <p>If you encounter any content or activity on the Services that you believe violates these Rules, please
              report it immediately to: <a href="mailto:legal@lummie.dev">legal@lummie.dev</a></p>
          </div>
        </main>
      </div>
    </div>
  )
}
