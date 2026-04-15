import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email'

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'EMAIL_INVALID', message: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // IMPORTANT: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions.'
      })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Delete any existing reset tokens for this user
    await db.verificationToken.deleteMany({
      where: {
        identifier: `reset:${user.id}`
      }
    })

    // Store new token
    await db.verificationToken.create({
      data: {
        identifier: `reset:${user.id}`,
        token: resetToken,
        expires: resetTokenExpiry
      }
    })

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    const resetUrl = `${baseUrl}?reset-token=${resetToken}&email=${encodeURIComponent(email)}`

    // Send email
    const emailTemplate = getPasswordResetEmailTemplate(resetUrl, user.name)
    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Akanut - Réinitialisation de votre mot de passe',
      html: emailTemplate.html,
      text: emailTemplate.text
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // Don't reveal the error to the user for security
    }

    // Log for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Password reset requested for:', email)
      console.log('📧 Reset URL:', resetUrl)
    }

    // IMPORTANT: Never return the token or reset URL in the response
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive reset instructions.'
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An error occurred' },
      { status: 500 }
    )
  }
}

// PATCH - Reset password with token
export async function PATCH(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json()

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Verify token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier: `reset:${user.id}`,
        token,
        expires: { gte: new Date() }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `reset:${user.id}`,
            token
          }
        }
      })
    ])

    // Delete all other reset tokens for this user
    await db.verificationToken.deleteMany({
      where: {
        identifier: `reset:${user.id}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An error occurred' },
      { status: 500 }
    )
  }
}
