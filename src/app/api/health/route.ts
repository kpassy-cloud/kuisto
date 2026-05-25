import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`
    
    // Count users
    const userCount = await db.user.count()
    
    // Check if any admin exists
    const adminCount = await db.user.count({
      where: { role: 'admin' }
    })
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      users: userCount,
      admins: adminCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
