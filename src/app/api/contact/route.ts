import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    const { name, email, subject, message } = body

    // Validate inputs
    const errors: string[] = []

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required')
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push('Email is required')
    } else if (!emailRegex.test(email)) {
      errors.push('Invalid email format')
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      errors.push('Subject is required')
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      errors.push('Message is required')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 255),
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
    }

    // Log the contact form submission
    // In production, you would:
    // 1. Store in database for tracking
    // 2. Send email using Resend, SendGrid, etc.
    // 3. Send notification to admin team
    console.log('=== Contact Form Submission ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Name:', sanitizedData.name)
    console.log('Email:', sanitizedData.email)
    console.log('Subject:', sanitizedData.subject)
    console.log('Message:', sanitizedData.message)
    console.log('================================')

    // TODO: Send email with Resend or similar service
    // Example with Resend:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@kuisto.ca',
    //   to: 'info@kuisto.ca',
    //   reply_to: sanitizedData.email,
    //   subject: `[Kuisto Contact] ${sanitizedData.subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${sanitizedData.name}</p>
    //     <p><strong>Email:</strong> ${sanitizedData.email}</p>
    //     <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${sanitizedData.message}</p>
    //   `,
    // })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
