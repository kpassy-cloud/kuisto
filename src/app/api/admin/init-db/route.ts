import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Initialize database with admin user - only works if no users exist
export async function POST(request: Request) {
  try {
    const { email, password, name, initKey } = await request.json()

    // Security: require an init key
    const expectedKey = process.env.ADMIN_INIT_KEY || 'kuisto-init-2024'

    if (initKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid init key' }, { status: 403 })
    }

    // Check if any users exist
    const existingUsers = await db.user.count()

    if (existingUsers > 0) {
      return NextResponse.json({
        error: 'Database already has users. Use normal registration.',
        userCount: existingUsers
      }, { status: 400 })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password || 'Admin123!', 12)

    const user = await db.user.create({
      data: {
        email: email || 'admin@kuisto.ca',
        password: hashedPassword,
        name: name || 'Admin',
        role: 'admin'
      }
    })

    // Create subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      login: {
        email: user.email,
        password: password || 'Admin123!'
      }
    })
  } catch (error) {
    console.error('Init DB error:', error)
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: String(error)
    }, { status: 500 })
  }
}

// GET - Check database status
export async function GET() {
  try {
    const userCount = await db.user.count()
    const adminCount = await db.user.count({ where: { role: 'admin' } })

    return NextResponse.json({
      userCount,
      adminCount,
      needsInit: userCount === 0,
      message: userCount === 0
        ? 'Database is empty. Use POST to create initial admin user.'
        : `Database has ${userCount} users, ${adminCount} admins.`
    })
  } catch (error) {
    console.error('DB status error:', error)
    return NextResponse.json({
      error: 'Database connection failed',
      details: String(error)
    }, { status: 500 })
  }
}
