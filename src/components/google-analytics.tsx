/**
 * Google Analytics Component
 *
 * To enable Google Analytics:
 * 1. Install the package: npm install @next/third-parties
 * 2. Uncomment the import and component code below
 * 3. Set NEXT_PUBLIC_GA_ID in your .env.local file with your GA4 Measurement ID (format: G-XXXXXXXXXX)
 */

// Uncomment after installing @next/third-parties:
import { GoogleAnalytics } from '@next/third-parties/google'

export function GoogleAnalyticsComponent() {
  // Uncomment after installing @next/third-parties and setting NEXT_PUBLIC_GA_ID:
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) return null
  return <GoogleAnalytics gaId={gaId} />

  return null
}
