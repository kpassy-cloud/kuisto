import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Test login endpoint for debugging
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email: normalizedEmail
      })
    }

    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'User has no password set'
      })
    }

    // Test password
    const isValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      success: isValid,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordMatch: isValid,
      message: isValid
        ? 'Password is correct! Login should work.'
        : 'Password is incorrect. Check your password.'
    })
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET - List all users (for debugging)
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      userCount: users.length,
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role
      }))
    })
  } catch (error) {
    console.error('Failed to list users:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
