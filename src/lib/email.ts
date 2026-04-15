import { Resend } from 'resend'

// Initialize Resend client (only when API key is available)
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface SendResult {
  success: boolean
  error?: string
  messageId?: string
}

// Send email using Resend (or log in development)
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<SendResult> {
  const resend = getResendClient()
  
  // In development without API key, simulate sending
  if (!resend) {
    console.log('📧 [DEV EMAIL] Simulating email send:')
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body preview: ${text || html.substring(0, 200)}...`)
    
    // In development, return success (simulated)
    return {
      success: true,
      messageId: `dev-${Date.now()}`
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Akanut <noreply@akanut.com>',
      to,
      subject,
      html,
      text
    })

    if (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      messageId: data?.id
    }
  } catch (err) {
    console.error('Email send exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

// Password reset email template
export function getPasswordResetEmailTemplate(
  resetUrl: string,
  userName?: string | null
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de votre mot de passe</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧑‍🍳 Akanut</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Des recettes saines avec vos ingrédients</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Réinitialisation de votre mot de passe</h2>
        
        <p style="color: #4b5563;">
          Bonjour ${userName || 'cher utilisateur'},
        </p>
        
        <p style="color: #4b5563;">
          Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte Akanut.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Ou copiez ce lien dans votre navigateur :
        </p>
        <p style="background: #e5e7eb; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #374151;">
          ${resetUrl}
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #ef4444; font-size: 14px; margin-bottom: 10px;">
            ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.
          </p>
          <p style="color: #6b7280; font-size: 13px;">
            Ce lien expire dans 1 heure pour votre sécurité.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Akanut. Tous droits réservés.</p>
        <p>Cet email a été envoyé à titre informatif uniquement.</p>
      </div>
    </body>
    </html>
  `

  const text = `
Akanut - Réinitialisation de votre mot de passe

Bonjour ${userName || 'cher utilisateur'},

Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte Akanut.

Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :
${resetUrl}

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

© ${new Date().getFullYear()} Akanut
  `.trim()

  return { html, text }
}

// Welcome email template
export function getWelcomeEmailTemplate(
  userName?: string | null
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue sur Akanut !</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🧑‍🍳 Akanut</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Des recettes saines avec vos ingrédients</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1f2937; margin-top: 0;">Bienvenue ${userName || 'chez Akanut'} ! 🎉</h2>
        
        <p style="color: #4b5563;">
          Merci d'avoir créé votre compte. Vous pouvez maintenant :
        </p>
        
        <ul style="color: #4b5563;">
          <li>Générer des recettes personnalisées avec vos ingrédients</li>
          <li>Sauvegarder vos recettes favorites</li>
          <li>Planifier vos repas de la semaine</li>
          <li>Créer des listes de courses automatiques</li>
        </ul>
        
        <p style="color: #4b5563;">
          Commencez dès maintenant à explorer des milliers de recettes saines et délicieuses !
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Akanut. Tous droits réservés.</p>
      </div>
    </body>
    </html>
  `

  const text = `
Bienvenue sur Akanut !

Bonjour ${userName || 'cher utilisateur'},

Merci d'avoir créé votre compte. Vous pouvez maintenant générer des recettes personnalisées, sauvegarder vos favoris, planifier vos repas et plus encore !

© ${new Date().getFullYear()} Akanut
  `.trim()

  return { html, text }
}
