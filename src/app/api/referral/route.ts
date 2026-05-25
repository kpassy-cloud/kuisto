import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'KUISTO-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET /api/referral - Get user's referral code and stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referralCount: true,
        referredBy: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: 'User not found' },
        { status: 404 }
      )
    }

    // Get referral stats
    const referrals = await db.referral.findMany({
      where: { referrerId: session.user.id },
      select: {
        id: true,
        createdAt: true,
        rewardGranted: true,
        referredUser: {
          select: {
            name: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate rewards (e.g., 5 bonus recipes per referral)
    const rewardsEarned = referrals.filter(r => r.rewardGranted).length
    const pendingRewards = referrals.filter(r => !r.rewardGranted).length

    return NextResponse.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referredBy: user.referredBy,
      referrals: referrals.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        rewardGranted: r.rewardGranted,
        referredUserName: r.referredUser.name || 'Anonymous',
      })),
      stats: {
        totalReferrals: referrals.length,
        rewardsEarned,
        pendingRewards,
        rewardPerReferral: 5, // 5 bonus recipes per referral
      }
    })
  } catch (error) {
    console.error('Get referral error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Failed to get referral information' },
      { status: 500 }
    )
  }
}

// POST /api/referral - Generate a unique referral code for user
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: 'User not found' },
        { status: 404 }
      )
    }

    // Already has a referral code
    if (user.referralCode) {
      return NextResponse.json({
        success: true,
        referralCode: user.referralCode,
        message: 'Referral code already exists'
      })
    }

    // Generate unique referral code
    let referralCode = generateReferralCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existing = await db.user.findUnique({
        where: { referralCode }
      })
      
      if (!existing) break
      
      referralCode = generateReferralCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'CODE_GENERATION_FAILED', message: 'Failed to generate unique referral code' },
        { status: 500 }
      )
    }

    // Update user with referral code
    await db.user.update({
      where: { id: session.user.id },
      data: { referralCode }
    })

    return NextResponse.json({
      success: true,
      referralCode,
      message: 'Referral code generated successfully'
    })
  } catch (error) {
    console.error('Generate referral code error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Failed to generate referral code' },
      { status: 500 }
    )
  }
}
