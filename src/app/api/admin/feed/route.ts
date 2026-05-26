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

// GET - List all feed items
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

    return NextResponse.json({ feed }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

// POST - Create feed item
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

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400, headers: corsHeaders })
    }

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

    // Try to create admin log
    try {
      await db.adminLog.create({
        data: {
          adminId: adminUser.id,
          action: 'feed_created',
          targetType: 'news',
          targetId: feedItem.id,
          details: JSON.stringify({ title, category })
        }
      })
    } catch (logError) {
      console.error('Failed to create admin log:', logError)
    }

    return NextResponse.json({ feedItem, success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error creating feed item:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders })
  }
}
