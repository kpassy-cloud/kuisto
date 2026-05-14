import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

// POST /api/stripe/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan as string

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Update user subscription
  await db.subscription.update({
    where: { userId },
    data: {
      plan,
      status: 'active',
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    }
  })

  // Log the event
  await db.adminLog.create({
    data: {
      adminId: userId,
      action: 'subscription_created',
      targetType: 'subscription',
      details: JSON.stringify({ plan, sessionId: session.id })
    }
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    // Try to find user by customer ID
    const existingSub = await db.subscription.findFirst({
      where: { stripeCustomerId: subscription.customer as string }
    })
    if (!existingSub) {
      console.error('User not found for subscription update')
      return
    }
  }

  const plan = subscription.metadata?.plan || 
    (subscription.items.data[0]?.price.nickname?.toLowerCase().includes('pro') ? 'pro' : 'premium')

  const status = subscription.status === 'active' ? 'active' : 
    subscription.status === 'past_due' ? 'past_due' :
    subscription.status === 'canceled' ? 'canceled' : 'inactive'

  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan,
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Downgrade to free plan
  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: 'free',
      status: 'canceled',
      cancelAtPeriodEnd: false
    }
  })

  // Log the cancellation
  const existingSub = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  })

  if (existingSub) {
    await db.adminLog.create({
      data: {
        adminId: existingSub.userId,
        action: 'subscription_canceled',
        targetType: 'subscription',
        details: JSON.stringify({ subscriptionId: subscription.id })
      }
    })
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string }
  })

  if (subscription) {
    await db.adminLog.create({
      data: {
        adminId: subscription.userId,
        action: 'payment_succeeded',
        targetType: 'invoice',
        details: JSON.stringify({ invoiceId: invoice.id, amount: invoice.amount_paid })
      }
    })
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  // Update subscription status
  await db.subscription.update({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: 'past_due' }
  })

  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string }
  })

  if (subscription) {
    await db.adminLog.create({
      data: {
        adminId: subscription.userId,
        action: 'payment_failed',
        targetType: 'invoice',
        details: JSON.stringify({ invoiceId: invoice.id, attempt: invoice.attempt_count })
      }
    })
  }
}
