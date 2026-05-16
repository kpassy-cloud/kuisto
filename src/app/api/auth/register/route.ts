import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Normalize email
    const normalizedEmail = email?.toLowerCase().trim()

    // Validation
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
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
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: 'Un compte existe déjà avec cette adresse email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Use transaction to create user with all related data atomically
    const user = await db.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name || normalizedEmail.split('@')[0],
        }
      })

      // Create default preferences
      await tx.userPreferences.create({
        data: { userId: newUser.id }
      })

      // Create free subscription
      await tx.subscription.create({
        data: { 
          userId: newUser.id,
          plan: 'free',
          status: 'active'
        }
      })

      return newUser
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