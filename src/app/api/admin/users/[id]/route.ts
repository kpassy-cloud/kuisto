import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        preferences: true,
        bonuses: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            favorites: true,
            history: true,
            mealPlans: true,
            adImpressions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update user (subscription, bonus, status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update_subscription': {
        const { plan, status } = data
        const subscription = await db.subscription.upsert({
          where: { userId: id },
          update: { plan, status },
          create: { userId: id, plan, status }
        })
        
        await db.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'subscription_updated',
            targetType: 'user',
            targetId: id,
            details: JSON.stringify({ plan, status })
          }
        })
        
        return NextResponse.json({ subscription })
      }

      case 'grant_bonus': {
        const { type, value, reason, expiresAt } = data
        const bonus = await db.userBonus.create({
          data: {
            userId: id,
            type,
            value,
            reason,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            grantedBy: adminUser.id
          }
        })
        
        await db.adminLog.create({
          data: {
            adminId: adminUser.id,
            action: 'bonus_granted',
            targetType: 'user',
            targetId: id,
            details: JSON.stringify({ type, value, reason })
          }
        })
        
        return NextResponse.json({ bonus })
      }

      case 'update_location': {
        const { country, region } = data
        const user = await db.user.update({
          where: { id },
          data: { country, region }
        })
        return NextResponse.json({ user })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = await params

    await db.user.delete({ where: { id } })
    
    await db.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'user_deleted',
        targetType: 'user',
        targetId: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
