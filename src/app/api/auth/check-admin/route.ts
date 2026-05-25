import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Check if the current user is admin (fresh check from database)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' })
    }

    // Check directly in database for fresh role
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    const isAdmin = user?.role === 'admin'

    return NextResponse.json({
      isAdmin,
      role: user?.role || 'user',
      email: session.user.email
    })
  } catch (error) {
    console.error('Failed to check admin status:', error)
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}
