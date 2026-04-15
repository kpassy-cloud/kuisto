import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This route allows promoting a user to admin
// In production, this should be protected or removed after initial setup
export async function POST(request: Request) {
  try {
    const { email, secretKey } = await request.json()
    
    // Simple protection - in production use proper authentication
    // You can set ADMIN_SETUP_KEY in your environment
    const setupKey = process.env.ADMIN_SETUP_KEY || 'akanut-admin-2024'
    
    if (secretKey !== setupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Find user and update role to admin
    const user = await db.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const updatedUser = await db.user.update({
      where: { email },
      data: { role: 'admin' }
    })
    
    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

// Get current admin status
export async function GET() {
  try {
    const admins = await db.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      adminCount: admins.length,
      admins
    })
  } catch (error) {
    console.error('Failed to get admins:', error)
    return NextResponse.json(
      { error: 'Failed to get admin list' },
      { status: 500 }
    )
  }
}
