import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: 'Un compte existe déjà avec cette adresse email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with subscription
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      }
    })

    // Create default preferences
    await db.userPreferences.create({
      data: { userId: user.id }
    })

    // Create free subscription
    await db.subscription.create({
      data: { 
        userId: user.id,
        plan: 'free',
        status: 'active'
      }
    })

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
