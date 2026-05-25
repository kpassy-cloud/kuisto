import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Debug endpoint to check session and database status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not authenticated'
      })
    }

    // Get user from database
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      authenticated: true,
      session: {
        email: session.user.email,
        name: session.user.name,
        plan: session.user.plan,
        role: session.user.role  // Role in JWT
      },
      database: dbUser ? {
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,  // Role in DB
        createdAt: dbUser.createdAt
      } : null,
      isMatching: session.user.role === dbUser?.role,
      instructions: session.user.role !== dbUser?.role
        ? 'Session role mismatch! Please log out and log in again to refresh the session.'
        : 'Session is up to date.'
    })
  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
