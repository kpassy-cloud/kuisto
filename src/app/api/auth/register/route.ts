import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    console.log('[REGISTER] Attempting to register:', email)

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'EMAIL_INVALID', message: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'PASSWORD_TOO_SHORT', message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      console.log('[REGISTER] User already exists:', normalizedEmail)
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: 'Un compte existe déjà avec cette adresse email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('[REGISTER] Creating user:', normalizedEmail)
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || normalizedEmail.split('@')[0],
      }
    })

    console.log('[REGISTER] User created:', user.id)

    // Create default subscription (ignore if fails)
    try {
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: 'free',
          status: 'active'
        }
      })
      console.log('[REGISTER] Subscription created')
    } catch (subError) {
      console.log('[REGISTER] Subscription creation failed (non-critical):', subError)
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
  } catch (error) {
    console.error('[REGISTER] Error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur lors de la création du compte', details: String(error) },
      { status: 500 }
    )
  }
}
