import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Create an initial admin key if none exist
// This is a one-time setup endpoint for existing databases
export async function POST(request: Request) {
  try {
    const { initKey } = await request.json()

    // Security: require an init key
    const expectedKey = process.env.ADMIN_INIT_KEY || 'kuisto-init-2024'

    if (initKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid init key' }, { status: 403 })
    }

    // Check if there are any existing admin keys
    const existingKeys = await db.adminKey.count()

    if (existingKeys > 0) {
      return NextResponse.json({
        error: 'Admin keys already exist',
        keyCount: existingKeys
      }, { status: 400 })
    }

    // Get the first admin user
    const admin = await db.user.findFirst({
      where: { role: 'admin' }
    })

    // Create an initial admin key
    const adminKey = await db.adminKey.create({
      data: {
        key: `kuisto-admin-key-${Date.now()}`,
        name: 'Initial Admin Key',
        description: 'Auto-generated key for promoting users to admin',
        maxUses: 10,
        active: true,
        createdBy: admin?.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin key created successfully',
      adminKey: {
        key: adminKey.key,
        name: adminKey.name,
        maxUses: adminKey.maxUses
      }
    })
  } catch (error) {
    console.error('Create admin key error:', error)
    return NextResponse.json({
      error: 'Failed to create admin key',
      details: String(error)
    }, { status: 500 })
  }
}
