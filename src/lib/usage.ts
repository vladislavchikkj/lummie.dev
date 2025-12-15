import { RateLimiterPrisma } from 'rate-limiter-flexible'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

const FREE_POINTS = 5
const PRO_POINTS = 100
const DURATION = 30 * 24 * 60 * 60 // 30 days
const GENERATION_COST = 1

export async function getUsageTracker() {
  const { sessionClaims } = await auth()

  const hasProAccess = (sessionClaims as { plan?: string })?.plan === 'pro'

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: 'Usage',
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
    duration: DURATION,
  })

  return usageTracker
}

export async function consumeCredits() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const usegaTracker = await getUsageTracker()
  const result = await usegaTracker.consume(userId, GENERATION_COST)

  return result
}

export async function getUsageStatus() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const hasProAccess = (sessionClaims as { plan?: string })?.plan === 'pro'
  const initialPoints = hasProAccess ? PRO_POINTS : FREE_POINTS

  const usegaTracker = await getUsageTracker()
  const result = await usegaTracker.get(userId)

  if (!result) {
    return {
      remainingPoints: initialPoints,
      msBeforeNext: DURATION * 1000,
      totalHits: 0,
      isFirstInDuration: true,
    }
  }

  return result
}
