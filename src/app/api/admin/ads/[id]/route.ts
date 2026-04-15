import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH - Update ad
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    const ad = await db.ad.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined
      }
    })

    await db.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'ad_updated',
        targetType: 'ad',
        targetId: id
      }
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    await db.ad.delete({ where: { id } })

    await db.adminLog.create({
      data: {
        adminId: adminUser.id,
        action: 'ad_deleted',
        targetType: 'ad',
        targetId: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
