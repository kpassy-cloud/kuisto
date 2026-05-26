import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// POST /api/admin/promote - Promote a user to admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, secret } = body

    // Simple secret to prevent unauthorized access
    if (secret !== 'kuisto-admin-promote-2024') {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Code secret invalide' },
        { status: 401, headers: corsHeaders }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'EMAIL_REQUIRED', message: 'Email requis' },
        { status: 400, headers: corsHeaders }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: 'Utilisateur non trouvé. Créez d\'abord un compte.' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Promote to admin
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    })

    console.log(`[ADMIN] User ${normalizedEmail} promoted to admin`)

    return NextResponse.json({
      success: true,
      message: `${normalizedEmail} est maintenant administrateur`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('[ADMIN] Promotion error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur lors de la promotion', details: String(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}

// GET /api/admin/promote - List all users
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      users,
      count: users.length
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('[ADMIN] List users error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500, headers: corsHeaders }
    )
  }
}
