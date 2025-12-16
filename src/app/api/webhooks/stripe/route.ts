import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Webhook signature verification failed:', error.message)
      return new NextResponse(`Webhook Error: ${error.message}`, {
        status: 400,
      })
    }
    return new NextResponse('Webhook Error: Unknown error', { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription
  const client = await clerkClient()

  const getUserId = async (): Promise<string | null> => {
    if (event.type === 'checkout.session.completed') {
      return session.metadata?.userId || null
    }

    if (
      event.type === 'customer.subscription.deleted' ||
      event.type === 'customer.subscription.updated'
    ) {
      if (subscription.metadata?.userId) {
        return subscription.metadata.userId
      }

      if (subscription.customer) {
        const customer =
          typeof subscription.customer === 'string'
            ? await stripe.customers.retrieve(subscription.customer)
            : subscription.customer

        if (customer && !customer.deleted && customer.metadata?.userId) {
          return customer.metadata.userId
        }
      }
    }

    return null
  }

  if (event.type === 'checkout.session.completed') {
    const userId = await getUserId()

    if (!userId) {
      return new NextResponse('User ID missing in metadata', { status: 400 })
    }

    if (session.subscription && typeof session.subscription === 'string') {
      await stripe.subscriptions.update(session.subscription, {
        metadata: { userId },
      })
    }

    if (session.customer && typeof session.customer === 'string') {
      await stripe.customers.update(session.customer, {
        metadata: { userId },
      })
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: 'pro',
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
      },
    })
  }

  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated'
  ) {
    const userId = await getUserId()

    if (userId) {
      const isActive =
        subscription.status === 'active' || subscription.status === 'trialing'

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: isActive ? 'pro' : 'free',
          stripeSubscriptionId: isActive ? subscription.id : null,
          stripeCustomerId:
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer?.id || null,
        },
      })
    }
  }

  return new NextResponse(null, { status: 200 })
}
