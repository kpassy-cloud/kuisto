import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const adminUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403, headers: corsHeaders })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get real-time stats
    const [
      totalUsers,
      activeUsersToday,
      premiumUsers,
      proUsers,
      freeUsers,
      totalAds,
      activeAds,
      totalFeedItems,
      recentLogs
    ] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: {
          history: {
            some: {
              cookedAt: {
                gte: new Date(now.toDateString())
              }
            }
          }
        }
      }),
      db.subscription.count({ where: { plan: 'premium', status: 'active' } }),
      db.subscription.count({ where: { plan: 'pro', status: 'active' } }),
      db.subscription.count({ where: { plan: 'free' } }),
      db.ad.count(),
      db.ad.count({ where: { active: true } }),
      db.newsFeed.count({ where: { active: true } }),
      db.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Get daily analytics for the range
    const dailyStats = await db.analytics.findMany({
      where: {
        date: {
          gte: startDate.toISOString().split('T')[0]
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get ad performance
    const adPerformance = await db.ad.findMany({
      where: { active: true },
      select: {
        id: true,
        title: true,
        type: true,
        impressions: true,
        clicks: true
      },
      orderBy: { impressions: 'desc' },
      take: 10
    })

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 
      ? ((premiumUsers + proUsers) / totalUsers * 100).toFixed(2)
      : 0

    // Calculate ad click rate
    const totalImpressions = adPerformance.reduce((sum, ad) => sum + ad.impressions, 0)
    const totalClicks = adPerformance.reduce((sum, ad) => sum + ad.clicks, 0)
    const clickRate = totalImpressions > 0 
      ? (totalClicks / totalImpressions * 100).toFixed(2)
      : 0

    // Get admin info for recent logs
    const adminIds = [...new Set(recentLogs.map(log => log.adminId))]
    const admins = await db.user.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true, email: true }
    })
    const adminMap = Object.fromEntries(admins.map(a => [a.id, a]))
    
    const logsWithAdmin = recentLogs.map(log => ({
      ...log,
      admin: adminMap[log.adminId] || { name: 'Unknown', email: 'Unknown' }
    }))

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsersToday,
        premiumUsers,
        proUsers,
        freeUsers,
        conversionRate,
        totalAds,
        activeAds,
        totalFeedItems,
        clickRate
      },
      dailyStats,
      adPerformance,
      recentLogs: logsWithAdmin
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}
