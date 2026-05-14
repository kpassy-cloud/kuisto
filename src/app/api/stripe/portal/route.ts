import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// POST /api/stripe/portal - Create a Stripe customer portal session
export async function POST() {
  try {
    const user = await getOrCreateUser()

    // Get user's subscription
    const subscription = await db.subscription.findUnique({
      where: { userId: user.id }
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun client Stripe trouvé. Veuillez d\'abord souscrire à un abonnement.' },
        { status: 400 }
      )
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/?portal=return`
    })

    return NextResponse.json({ 
      url: portalSession.url 
    })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du portail client' },
      { status: 500 }
    )
  }
}
