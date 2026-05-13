import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

// GET - List all admin keys
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const keys = await db.adminKey.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Failed to fetch admin keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new admin key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, description, maxUses, expiresAt } = body
    
    // Generate a random key
    const keyValue = `kuisto-${randomBytes(8).toString('hex')}`
    
    const key = await db.adminKey.create({
      data: {
        key: keyValue,
        name: name || null,
        description: description || null,
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: user.id
      }
    })
    
    // Log this action
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: 'admin_key_created',
        targetType: 'admin_key',
        targetId: key.id,
        details: JSON.stringify({ keyName: name, keyValue })
      }
    })
    
    return NextResponse.json({ key })
  } catch (error) {
    console.error('Failed to create admin key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an admin key
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { keyId } = await request.json()
    
    await db.adminKey.delete({
      where: { id: keyId }
    })
    
    // Log this action
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: 'admin_key_deleted',
        targetType: 'admin_key',
        targetId: keyId
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete admin key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Toggle key active status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { keyId, active } = await request.json()
    
    const key = await db.adminKey.update({
      where: { id: keyId },
      data: { active }
    })
    
    return NextResponse.json({ key })
  } catch (error) {
    console.error('Failed to update admin key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
