import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// GET /api/newsletter - Check if email is subscribed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    return NextResponse.json({
      subscribed: !!subscriber && subscriber.active,
      subscriber: subscriber ? {
        email: subscriber.email,
        active: subscriber.active,
        source: subscriber.source,
        createdAt: subscriber.createdAt
      } : null
    })
  } catch (error) {
    console.error('Check newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la verification' },
      { status: 500 }
    )
  }
}

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'footer' } = body

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if already subscribed
    const existingSubscriber = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { error: 'Cet email est deja inscrit', alreadySubscribed: true },
          { status: 400 }
        )
      } else {
        // Reactivate previously unsubscribed user
        const updated = await db.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            active: true,
            source,
            updatedAt: new Date()
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Reinscription reussie',
          subscriber: {
            email: updated.email,
            active: updated.active,
            source: updated.source
          }
        })
      }
    }

    // Create new subscriber
    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        active: true,
        source
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription reussie',
      subscriber: {
        email: subscriber.email,
        active: subscriber.active,
        source: subscriber.source
      }
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/newsletter - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email non trouve' },
        { status: 404 }
      )
    }

    // Mark as inactive instead of deleting
    await db.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        active: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Desinscription reussie'
    })
  } catch (error) {
    console.error('Newsletter unsubscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la desinscription' },
      { status: 500 }
    )
  }
}
