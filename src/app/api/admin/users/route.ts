import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - List all users with pagination and filters
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (plan || status) {
      where.subscription = {}
      if (plan) where.subscription.plan = plan
      if (status) where.subscription.status = status
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          subscription: true,
          _count: {
            select: {
              favorites: true,
              history: true,
              bonuses: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.user.count({ where })
    ])

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        image: u.image,
        role: u.role,
        country: u.country,
        region: u.region,
        createdAt: u.createdAt,
        subscription: u.subscription,
        stats: u._count
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
