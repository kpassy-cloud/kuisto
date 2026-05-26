import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET - List all ads
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

    return NextResponse.json({ ads }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// POST - Create new ad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const adminUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403, headers: corsHeaders })
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

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400, headers: corsHeaders })
    }

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

    // Try to create admin log, but don't fail if it errors
    try {
      await db.adminLog.create({
        data: {
          adminId: adminUser.id,
          action: 'ad_created',
          targetType: 'ad',
          targetId: ad.id,
          details: JSON.stringify({ title, type })
        }
      })
    } catch (logError) {
      console.error('Failed to create admin log:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ ad, success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500, headers: corsHeaders })
  }
}
