import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This route allows promoting a user to admin using a key
// Only database keys are accepted (no default fallback for security)
export async function POST(request: Request) {
  try {
    const { email, secretKey } = await request.json()
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Secret key is required' },
        { status: 400 }
      )
    }
    
    // Check database for valid keys only (no default key for security)
    const dbKey = await db.adminKey.findUnique({
      where: { key: secretKey }
    })
    
    // Validate database key
    if (!dbKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }
    
    if (!dbKey.active) {
      return NextResponse.json(
        { error: 'This key has been deactivated' },
        { status: 403 }
      )
    }
    
    if (dbKey.expiresAt && new Date(dbKey.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This key has expired' },
        { status: 403 }
      )
    }
    
    if (dbKey.useCount >= dbKey.maxUses) {
      return NextResponse.json(
        { error: 'This key has reached its maximum uses' },
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
        { error: 'User not found. Please create an account first.' },
        { status: 404 }
      )
    }
    
    // Update user role
    const updatedUser = await db.user.update({
      where: { email },
      data: { role: 'admin' }
    })
    
    // Update key usage
    await db.adminKey.update({
      where: { id: dbKey.id },
      data: {
        useCount: { increment: 1 },
        usedBy: user.id,
        usedAt: new Date()
      }
    })
    
    // Log this action
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: 'user_promoted_to_admin',
        targetType: 'user',
        targetId: user.id,
        details: JSON.stringify({ 
          email, 
          keyName: dbKey.name,
          keyId: dbKey.id
        })
      }
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
