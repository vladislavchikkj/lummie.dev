import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/app/constants'
import { Metadata } from 'next'
import CookieManager from '@/app/(home)/(info)/cookie/cookie-manager'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Cookie Policy',
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
export default function CookiePage() {
  return (
    <div
      className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 min-h-screen antialiased transition-colors duration-300">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

        <header className="text-center mb-16 sm:mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Cookie Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">
            Effective Date: <strong className="font-semibold">August 29, 2025</strong>
          </p>
        </header>

        <main
          className="mt-12 p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl shadow-indigo-100/50 dark:shadow-none
         text-lg leading-relaxed space-y-6">

          <p>This Cookie Policy explains how lummie.dev ("Company," "we," "us," or "our") uses cookies and similar
            technologies (such as web beacons, pixels, and scripts) to recognize you when you visit our website at
            lummie.dev and use our Services. It explains what these technologies are, why we use them, and your rights
            to control our use of them.</p>

          <h2 className="text-3xl font-extrabold mt-10 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            1. What are Cookies?
          </h2>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website.
            They are widely used by website owners to make their websites work, or to work more efficiently, as well as
            to provide reporting information.</p>
          <p>Cookies set by the website owner (in this case, lummie.dev) are called <strong
            className="font-extrabold text-gray-900 dark:text-gray-50">"first-party cookies."</strong> Cookies set
            by parties other than the website owner are called <strong
              className="font-extrabold text-gray-900 dark:text-gray-50">"third-party cookies."</strong> Third-party
            cookies enable
            third-party features or functionality to be provided on or through the website (e.g., advertising,
            interactive content, and analytics).</p>

          <h2 className="text-3xl font-extrabold mt-10 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            2. How We Use Cookies
          </h2>
          <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical
            reasons for our Services to operate, and we refer to these as <strong
              className="font-extrabold text-gray-900 dark:text-gray-50">"essential" or "strictly
              necessary"</strong> cookies.
            Other cookies enable us to track and target the interests of our users to enhance the experience on our
            Services. Third parties serve cookies through our Services for advertising, analytics, and other
            purposes.</p>

          <h2 className="text-3xl font-extrabold mt-10 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            3. The Types of Cookies We Use
          </h2>
          <p>The specific types of first- and third-party cookies served through our Services and the purposes they
            perform are described below:</p>

          <h3 className="text-2xl font-bold mt-8 mb-3">A. Strictly Necessary Cookies (Essential)</h3>
          <p>These cookies are essential to provide you with services available through our website and to enable you to
            use some of its features, such as accessing secure areas and maintaining your session. We are not required
            to obtain your consent for these cookies.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-extrabold text-gray-900 dark:text-gray-50">Purpose:</strong> User
              authentication, session management, security.
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-8 mb-3">B. Performance and Functionality Cookies</h3>
          <p>These cookies are used to enhance the performance and functionality of our Services but are non-essential
            to their use. However, without these cookies, certain functionality (like remembering preferences) may
            become unavailable.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-extrabold text-gray-900 dark:text-gray-50">Purpose:</strong> Remembering your
              login details, site preferences, and regional settings.
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-8 mb-3">C. Analytics and Customization Cookies</h3>
          <p>These cookies collect information that is used either in aggregate form to help us understand how our
            Services are being used or how effective our marketing campaigns are, or to help us customize our Services
            for you.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-extrabold text-gray-900 dark:text-gray-50">Purpose:</strong> Tracking site
              traffic, analyzing user behaviour (e.g., using Google
              Analytics), and improving the user interface.
            </li>
          </ul>

          <h3 className="text-2xl font-bold mt-8 mb-3">D. Advertising and Targeting Cookies</h3>
          <p>These cookies are used to make advertising messages more relevant to you. They perform functions like
            preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some
            cases, selecting advertisements that are based on your interests.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-extrabold text-gray-900 dark:text-gray-50">Purpose:</strong> Delivering targeted
              advertisements, measuring the effectiveness of ad
              campaigns, and providing data to advertising partners.
            </li>
          </ul>

          <h2 className="text-3xl font-extrabold mt-10 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            4. Your Control Over Cookies
          </h2>
          <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences
            by clicking on the appropriate opt-out links provided within the cookie banner on our website or by managing
            your preferences through your browser settings.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-extrabold text-gray-900 dark:text-gray-50">Browser Controls:</strong> You can
              set or amend your web browser controls to accept or refuse
              cookies. If you choose to reject cookies, you may still use our website, though your access to some
              functionality and areas of our Services may be restricted.
            </li>
            <li><strong className="font-extrabold text-gray-900 dark:text-gray-50">Cookie Consent Tool:</strong> For
              users in regions requiring explicit consent (like the European
              Union), we will deploy a cookie consent mechanism that allows you to manage which non-essential cookies
              are enabled.
            </li>
          </ul>

          <h2 className="text-3xl font-extrabold mt-10 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            5. Changes to the Cookie Policy
          </h2>
          <p>We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for
            other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay
            informed about our use of cookies and related technologies.</p>

          <h2 className="text-3xl font-extrabold mt-10 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            6. Contact Us
          </h2>
          <p>If you have any questions about our use of cookies or other technologies, please email us at:
            <a href="mailto:legal@lummie.dev"
               className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-semibold">legal@lummie.dev</a>
          </p>
          <CookieManager />
        </main>
      </div>
    </div>
  )
}