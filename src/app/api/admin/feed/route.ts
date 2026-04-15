import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - List all feed items
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
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (active !== null) where.active = active === 'true'

    const feed = await db.newsFeed.findMany({
      where,
      orderBy: [
        { sticky: 'desc' },
        { featured: 'desc' },
        { publishAt: 'desc' }
      ]
    })

    return NextResponse.json({ feed })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create feed item
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
      content,
      imageUrl,
      linkUrl,
      category = 'tip',
      targetTiers = 'all',
      targetCountries,
      active = true,
      publishAt,
      expiresAt,
      featured = false,
      sticky = false
    } = body

    const feedItem = await db.newsFeed.create({
      data: {
        title,
        content,
        imageUrl,
        linkUrl,
        category,
        targetTiers,
        targetCountries,
        active,
        publishAt: publishAt ? new Date(publishAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        featured,
        sticky,
        authorId: adminUser.id
      }
    })

    await db.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'feed_created',
        targetType: 'news',
        targetId: feedItem.id,
        details: JSON.stringify({ title, category })
      }
    })

    return NextResponse.json({ feedItem })
  } catch (error) {
    console.error('Error creating feed item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
