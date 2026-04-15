import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - List all announcements
export async function GET(request: NextRequest) {
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

    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create announcement
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      message,
      type = 'info',
      icon,
      targetUsers = 'all',
      targetCountries,
      displayType = 'banner',
      dismissible = true,
      active = true,
      startDate,
      endDate
    } = body

    const announcement = await db.announcement.create({
      data: {
        title,
        message,
        type,
        icon,
        targetUsers,
        targetCountries,
        displayType,
        dismissible,
        active,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    await db.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'announcement_created',
        targetType: 'announcement',
        targetId: announcement.id,
        details: JSON.stringify({ title, type })
      }
    })

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
