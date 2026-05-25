import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

// Initialize first admin key - only works if no admins exist
export async function POST(request: Request) {
  try {
    // Check if any admin exists
    const existingAdmins = await db.user.findMany({
      where: { role: 'admin' }
    })
    
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admins already exist. Use the admin dashboard to create keys.' },
        { status: 403 }
      )
    }
    
    // Check if any admin key exists
    const existingKeys = await db.adminKey.findMany()
    
    if (existingKeys.length > 0) {
      return NextResponse.json(
        { error: 'Admin keys already exist. Use an existing key to become admin.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { initKey } = body
    
    // Require an initialization key from environment (no default for security)
    const expectedInitKey = process.env.ADMIN_INIT_KEY

    if (!expectedInitKey) {
      return NextResponse.json(
        { error: 'Admin initialization is not configured. Set ADMIN_INIT_KEY environment variable.' },
        { status: 503 }
      )
    }

    if (initKey !== expectedInitKey) {
      return NextResponse.json(
        { error: 'Invalid initialization key' },
        { status: 403 }
      )
    }
    
    // Generate first admin key
    const keyValue = `kuisto-admin-${randomBytes(8).toString('hex')}`
    
    const key = await db.adminKey.create({
      data: {
        key: keyValue,
        name: 'Initial Admin Key',
        description: 'First admin key - use this to promote the first administrator',
        maxUses: 1,
        active: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'First admin key created successfully',
      key: {
        id: key.id,
        key: keyValue,
        name: key.name,
        maxUses: key.maxUses
      },
      instructions: 'Use this key in the "Become Admin" section to promote your account to administrator.'
    })
  } catch (error) {
    console.error('Admin init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize admin system' },
      { status: 500 }
    )
  }
}
