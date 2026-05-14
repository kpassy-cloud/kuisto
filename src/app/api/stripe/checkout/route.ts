import { NextRequest, NextResponse } from 'next/server'
import { stripe, getOrCreateStripeCustomerId, getPriceId } from '@/lib/stripe'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// POST /api/stripe/checkout - Create a Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const { plan, interval = 'monthly' } = body

    if (!plan || !['premium', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide. Choisissez "premium" ou "pro".' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Intervalle invalide. Choisissez "monthly" ou "yearly".' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomerId(user.id, user.email || '')

    // Get price ID
    const priceId = getPriceId(plan as 'premium' | 'pro', interval as 'monthly' | 'yearly')

    if (!priceId) {
      return NextResponse.json(
        { error: 'Configuration de prix manquante. Veuillez contacter le support.' },
        { status: 500 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXTAUTH_URL}/?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?subscription=canceled`,
      metadata: {
        userId: user.id,
        plan,
        interval
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto'
      }
    })

    // Log the checkout attempt
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: 'checkout_started',
        targetType: 'subscription',
        details: JSON.stringify({ plan, interval, sessionId: session.id })
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
