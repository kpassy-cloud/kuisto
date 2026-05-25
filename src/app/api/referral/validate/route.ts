import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/referral/validate - Validate a referral code during registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({
        valid: false,
        error: 'CODE_REQUIRED',
        message: 'Referral code is required'
      })
    }

    // Normalize the code (uppercase, trim)
    const normalizedCode = code.trim().toUpperCase()

    // Check if code format is valid (KUISTO-XXXXXX)
    if (!normalizedCode.startsWith('KUISTO-')) {
      return NextResponse.json({
        valid: false,
        error: 'INVALID_FORMAT',
        message: 'Invalid referral code format'
      })
    }

    // Find user with this referral code
    const referrer = await db.user.findUnique({
      where: { referralCode: normalizedCode },
      select: {
        id: true,
        name: true,
        referralCode: true,
      }
    })

    if (!referrer) {
      return NextResponse.json({
        valid: false,
        error: 'CODE_NOT_FOUND',
        message: 'Referral code not found'
      })
    }

    return NextResponse.json({
      valid: true,
      referrerName: referrer.name || 'A friend',
      referralCode: referrer.referralCode,
      message: 'Valid referral code'
    })
  } catch (error) {
    console.error('Validate referral code error:', error)
    return NextResponse.json({
      valid: false,
      error: 'SERVER_ERROR',
      message: 'Failed to validate referral code'
    })
  }
}
