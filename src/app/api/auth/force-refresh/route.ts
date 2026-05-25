import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Force refresh session with fresh data from database
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get fresh user data from database
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Promote to admin if the email matches
    if (dbUser.email === 'admin@kuisto.ca' && dbUser.role !== 'admin') {
      await db.user.update({
        where: { email: dbUser.email },
        data: { role: 'admin' }
      })
      console.log(`[ADMIN] Promoted ${dbUser.email} to admin`)
      dbUser.role = 'admin'
    }

    return NextResponse.json({
      success: true,
      message: 'Session data retrieved',
      user: dbUser,
      isAdmin: dbUser.role === 'admin',
      instruction: 'Please log out and log in again to refresh your session with the new role.'
    })
  } catch (error) {
    console.error('Force refresh error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET - Show current status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not logged in. Please log in first.'
      })
    }

    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({
      authenticated: true,
      sessionEmail: session.user.email,
      sessionRole: session.user.role,
      databaseRole: dbUser?.role,
      isAdminInDatabase: dbUser?.role === 'admin',
      isAdminInSession: session.user.role === 'admin',
      needsReLogin: session.user.role !== dbUser?.role,
      action: session.user.role !== dbUser?.role
        ? 'LOG OUT and LOG IN AGAIN to refresh your session'
        : 'Your session is up to date. You should see the Admin button.'
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
