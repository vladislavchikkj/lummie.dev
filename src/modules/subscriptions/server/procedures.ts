import { protectedProcedure, createTRPCRouter } from '@/trpc/init'
import { stripe } from '@/lib/stripe'
import { TRPCError } from '@trpc/server'
import { clerkClient } from '@clerk/nextjs/server'

export const subscriptionRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { auth } = ctx
    const userId = auth.userId
    const user = await clerkClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId || !appUrl) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stripe config missing',
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: (await user.users.getUser(userId))?.emailAddresses[0]
        .emailAddress,
      metadata: { userId },
      success_url: `${appUrl}/pricing?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    })

    if (!session.url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session',
      })
    }

    return { url: session.url }
  }),

  createCustomerPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const { auth } = ctx
    const userId = auth.userId
    const user = await clerkClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!appUrl) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'App URL missing',
      })
    }

    // Получаем stripeCustomerId из метаданных пользователя
    const clerkUser = await user.users.getUser(userId)
    const publicMetadata = clerkUser.publicMetadata as {
      stripeCustomerId?: string
    }

    const stripeCustomerId = publicMetadata.stripeCustomerId

    if (!stripeCustomerId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No Stripe customer ID found. Please contact support.',
      })
    }

    // Создаем сессию для Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/pricing`,
    })

    if (!portalSession.url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create portal session',
      })
    }

    return { url: portalSession.url }
  }),
})
