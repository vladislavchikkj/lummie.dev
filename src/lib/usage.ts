import { RateLimiterPrisma } from 'rate-limiter-flexible'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

const FREE_POINTS = 5
const PRO_POINTS = 100
const DURATION = 30 * 24 * 60 * 60
const GENERATION_COST = 1

export async function getUsageTracker() {
  const { sessionClaims } = await auth()

  const plan = (sessionClaims?.publicMetadata as { plan?: string })?.plan
  const hasProAccess = plan === 'pro'

  const pointsLimit = hasProAccess ? FREE_POINTS + PRO_POINTS : FREE_POINTS

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: 'Usage',
    points: pointsLimit,
    duration: DURATION,
  })

  return usageTracker
}

export async function consumeCredits() {
  const { userId } = await auth()
  if (!userId) throw new Error('User not authenticated')

  const usageTracker = await getUsageTracker()
  const result = await usageTracker.consume(userId, GENERATION_COST)

  return result
}

export async function getUsageStatus() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null // Или throw new Error

  const plan = (sessionClaims?.publicMetadata as { plan?: string })?.plan
  const hasProAccess = plan === 'pro'
  const pointsLimit = hasProAccess ? FREE_POINTS + PRO_POINTS : FREE_POINTS

  const usageTracker = await getUsageTracker()
  const result = await usageTracker.get(userId)

  if (!result) {
    return {
      remainingPoints: pointsLimit,
      msBeforeNext: DURATION * 1000,
      totalHits: 0,
      isFirstInDuration: true,
    }
  }

  return result
}
