import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - List all ads
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

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (active !== null) where.active = active === 'true'
    if (type) where.type = type

    const ads = await db.ad.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new ad
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
      description,
      imageUrl,
      linkUrl,
      buttonText,
      type = 'banner',
      targetTiers = '["free"]',
      targetCountries,
      targetRegions,
      active = true,
      startDate,
      endDate,
      priority = 0
    } = body

    const ad = await db.ad.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        buttonText,
        type,
        targetTiers,
        targetCountries,
        targetRegions,
        active,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority,
        createdBy: adminUser.id
      }
    })

    await db.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'ad_created',
        targetType: 'ad',
        targetId: ad.id,
        details: JSON.stringify({ title, type })
      }
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
