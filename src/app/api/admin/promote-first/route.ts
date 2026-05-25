import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// One-time promotion endpoint for the first admin
// This will only work if:
// 1. No admins exist yet, OR
// 2. A specific init key is provided
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { initKey, email } = body

    // Check existing admins
    const existingAdmins = await db.user.findMany({
      where: { role: 'admin' }
    })

    // Get the init key from environment or use a secure default
    const expectedInitKey = process.env.ADMIN_INIT_KEY

    // If admins already exist, require the init key
    if (existingAdmins.length > 0) {
      if (!expectedInitKey || initKey !== expectedInitKey) {
        return NextResponse.json(
          { error: 'Admins already exist. Use the admin dashboard to manage keys.' },
          { status: 403 }
        )
      }
    }

    // Target email to promote
    const targetEmail = email || 'admin@kuisto.ca'

    // Find user
    const user = await db.user.findUnique({
      where: { email: targetEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: `User ${targetEmail} not found. Please create the account first.` },
        { status: 404 }
      )
    }

    // Check for and delete any insecure default keys
    const defaultPatterns = ['kuisto-admin-2024', 'akanut-admin-2024']
    const existingKeys = await db.adminKey.findMany()

    for (const key of existingKeys) {
      if (defaultPatterns.some(p => key.key.includes(p) || key.key === p)) {
        await db.adminKey.delete({ where: { id: key.id } })
        console.log(`Deleted insecure key: ${key.key}`)
      }
    }

    // Promote user to admin
    const updatedUser = await db.user.update({
      where: { email: targetEmail },
      data: { role: 'admin' }
    })

    // Log this action
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: existingAdmins.length > 0 ? 'admin_promotion_via_key' : 'first_admin_promotion',
        targetType: 'user',
        targetId: user.id,
        details: JSON.stringify({
          email: targetEmail,
          method: 'promote-first-endpoint'
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `User ${targetEmail} promoted to admin successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      },
      note: existingAdmins.length > 0
        ? 'Additional admin created. Please secure the ADMIN_INIT_KEY environment variable.'
        : 'First admin created. You can now access the admin dashboard and create keys for other users.'
    })
  } catch (error) {
    console.error('Admin promotion error:', error)
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    )
  }
}

// GET - Check admin status
export async function GET() {
  try {
    const admins = await db.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    const keys = await db.adminKey.findMany()

    return NextResponse.json({
      adminCount: admins.length,
      admins: admins.map(a => ({ email: a.email, name: a.name })),
      keyCount: keys.length,
      hasInsecureKeys: keys.some(k =>
        ['kuisto-admin-2024', 'akanut-admin-2024'].some(p => k.key.includes(p))
      )
    })
  } catch (error) {
    console.error('Failed to get admin status:', error)
    return NextResponse.json(
      { error: 'Failed to get admin status' },
      { status: 500 }
    )
  }
}
