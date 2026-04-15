import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get ads for current user based on tier and location
export async function GET(request: NextRequest) {
  try {
    // Check if ad model is available (may not be after schema update without restart)
    if (!db.ad) {
      return NextResponse.json({ ads: [] })
    }
    
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'banner'
    const country = searchParams.get('country')
    const region = searchParams.get('region')

    // Determine user tier
    let userTier = 'free'
    let userId = null

    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
      })
      userId = user?.id
      userTier = user?.subscription?.plan || 'free'
    }

    // If user is premium or pro, no ads
    if (userTier === 'premium' || userTier === 'pro') {
      return NextResponse.json({ ads: [] })
    }

    // Build where clause for ads
    const now = new Date()
    
    const ads = await db.ad.findMany({
      where: {
        active: true,
        type,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5
    })

    // Filter by tier targeting
    const filteredAds = ads.filter(ad => {
      try {
        const targetTiers = JSON.parse(ad.targetTiers)
        if (!targetTiers.includes('free') && !targetTiers.includes('all')) {
          return false
        }
        
        // Filter by country if specified
        if (ad.targetCountries && country) {
          const targetCountries = JSON.parse(ad.targetCountries)
          if (targetCountries.length > 0 && !targetCountries.includes(country)) {
            return false
          }
        }
        
        // Filter by region if specified
        if (ad.targetRegions && region) {
          const targetRegions = JSON.parse(ad.targetRegions)
          if (targetRegions.length > 0 && !targetRegions.includes(region)) {
            return false
          }
        }
        
        return true
      } catch {
        return true
      }
    })

    // Record impressions
    if (userId && filteredAds.length > 0) {
      await Promise.all(
        filteredAds.slice(0, 3).map(ad =>
          db.adImpression.create({
            data: {
              adId: ad.id,
              userId,
              viewed: true
            }
          })
        )
      )
      
      // Update impression count
      await Promise.all(
        filteredAds.slice(0, 3).map(ad =>
          db.ad.update({
            where: { id: ad.id },
            data: { impressions: { increment: 1 } }
          })
        )
      )
    }

    return NextResponse.json({ ads: filteredAds })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ ads: [] })
  }
}

// POST - Record ad click
export async function POST(request: NextRequest) {
  try {
    // Check if models are available
    if (!db.ad) {
      return NextResponse.json({ success: true })
    }
    
    const { adId } = await request.json()
    const session = await getServerSession(authOptions)

    // Update click count
    await db.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } }
    })

    // Record click in impression if user logged in
    if (session?.user?.email && db.adImpression) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (user) {
        await db.adImpression.updateMany({
          where: { adId, userId: user.id, clicked: false },
          data: { clicked: true }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording ad click:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
