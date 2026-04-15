import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateUser } from '@/lib/server-auth'

// GET /api/subscription - Get current subscription
export async function GET() {
  try {
    const user = await getOrCreateUser()

    const subscription = await db.subscription.findUnique({
      where: { userId: user.id }
    })

    // If no subscription exists, create a free one
    if (!subscription) {
      const newSubscription = await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'free',
          status: 'active'
        }
      })
      return NextResponse.json({ subscription: newSubscription })
    }

    // Reset daily usage if needed (check if last update was yesterday)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastUpdate = subscription.updatedAt
    const lastUpdateDate = new Date(lastUpdate)
    lastUpdateDate.setHours(0, 0, 0, 0)

    if (lastUpdateDate < today) {
      const updatedSubscription = await db.subscription.update({
        where: { id: subscription.id },
        data: {
          recipesGenerated: 0,
          mealPlansCreated: 0
        }
      })
      return NextResponse.json({ subscription: updatedSubscription })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}

// POST /api/subscription - Update/upgrade subscription
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await request.json()
    const { plan } = body

    if (!plan || !['free', 'premium', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      )
    }

    // Calculate period end (30 days from now for paid plans)
    const currentPeriodEnd = plan !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null

    const subscription = await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan,
        status: 'active',
        currentPeriodStart: plan !== 'free' ? new Date() : null,
        currentPeriodEnd,
      },
      update: {
        plan,
        status: 'active',
        currentPeriodStart: plan !== 'free' ? new Date() : null,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      }
    })

    return NextResponse.json({ 
      success: true,
      subscription 
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'abonnement' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscription - Cancel subscription
export async function DELETE() {
  try {
    const user = await getOrCreateUser()

    const subscription = await db.subscription.findUnique({
      where: { userId: user.id }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Abonnement non trouvé' },
        { status: 404 }
      )
    }

    // Mark for cancellation at period end
    const updated = await db.subscription.update({
      where: { userId: user.id },
      data: {
        cancelAtPeriodEnd: true
      }
    })

    return NextResponse.json({ 
      success: true,
      subscription: updated 
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    )
  }
}
