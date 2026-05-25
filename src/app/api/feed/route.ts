import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get feed items for current user
export async function GET(request: NextRequest) {
  try {
    // Check if newsFeed model is available (may not be after schema update without restart)
    if (!db.newsFeed) {
      return NextResponse.json({ feed: [] })
    }
    
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')

    // Determine user tier
    let userTier = 'free'
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
      })
      userTier = user?.subscription?.plan || 'free'
    }

    const now = new Date()
    
    const where: Record<string, unknown> = {
      active: true,
      publishAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } }
      ]
    }

    if (category) {
      where.category = category
    }

    const feed = await db.newsFeed.findMany({
      where,
      orderBy: [
        { sticky: 'desc' },
        { featured: 'desc' },
        { publishAt: 'desc' }
      ],
      take: limit
    })

    // Filter by tier and country
    const filteredFeed = feed.filter(item => {
      try {
        // Check tier targeting
        if (item.targetTiers !== 'all') {
          const targetTiers = JSON.parse(item.targetTiers)
          if (!targetTiers.includes(userTier)) {
            return false
          }
        }
        
        // Check country targeting
        if (item.targetCountries && country) {
          const targetCountries = JSON.parse(item.targetCountries)
          if (targetCountries.length > 0 && !targetCountries.includes(country)) {
            return false
          }
        }
        
        return true
      } catch {
        return true
      }
    })

    return NextResponse.json({ feed: filteredFeed })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ feed: [] })
  }
}

// POST - Record feed view or like
export async function POST(request: NextRequest) {
  try {
    // Check if newsFeed model is available
    if (!db.newsFeed) {
      return NextResponse.json({ success: true })
    }
    
    const { feedId, action } = await request.json()

    if (action === 'view') {
      await db.newsFeed.update({
        where: { id: feedId },
        data: { views: { increment: 1 } }
      })
    } else if (action === 'like') {
      await db.newsFeed.update({
        where: { id: feedId },
        data: { likes: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
