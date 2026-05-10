import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'onboarding@resend.dev' // Change this to your verified domain

/**
 * Send client invite email with registration link
 */
export async function sendClientInviteEmail(
  toEmail: string,
  clientName: string | undefined,
  coachName: string | undefined,
  inviteToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Build invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?token=${inviteToken}&email=${encodeURIComponent(toEmail)}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 32px;">Vexlon</h1>
          <p style="color: #a1a1a1; margin: 8px 0 0 0;">Professional Coaching Platform</p>
        </div>

        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000000; margin: 0 0 16px 0;">You're Invited to Join Vexlon</h2>

          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            ${coachName ? `<strong>${coachName}</strong> has invited you to join their coaching program on` : 'You have been invited to join'} <strong>Vexlon</strong>, a professional coaching platform.
          </p>

          <p style="color: #4b5563; margin: 0 0 30px 0; line-height: 1.6;">
            Get personalized coaching feedback, track your progress, and achieve your fitness goals under expert guidance.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Create Account & Get Started
            </a>
          </div>

          <p style="color: #9ca3af; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px;">
            This invitation link expires in 7 days. If you have any questions, please reply to this email.
          </p>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `${coachName ? coachName + ' invited you to' : 'You\'re invited to'} Vexlon`,
      html: emailHtml,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email service error:', err)
    return { success: false, error: String(err) }
  }
}

/**
 * Send coach signup email (optional)
 */
export async function sendCoachSignupEmail(
  toEmail: string,
  coachName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 32px;">Vexlon</h1>
          <p style="color: #a1a1a1; margin: 8px 0 0 0;">Professional Coaching Platform</p>
        </div>

        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000000; margin: 0 0 16px 0;">Welcome to Vexlon, ${coachName}!</h2>

          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            Your coaching dashboard is ready. Start managing your clients and providing personalized feedback.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #4b5563; margin: 0; line-height: 1.6;">
              <strong>Next Steps:</strong><br>
              1. Log in to your coaching dashboard<br>
              2. Add your first client<br>
              3. Send them an invitation link<br>
              4. Start coaching!
            </p>
          </div>

          <p style="color: #9ca3af; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px;">
            Questions? Contact support@vexlon.com
          </p>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Welcome to Vexlon - Your Coaching Dashboard Awaits',
      html: emailHtml,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email service error:', err)
    return { success: false, error: String(err) }
  }
}

/**
 * Send email verification for email change
 */
export async function sendEmailVerificationEmail(
  toEmail: string,
  verificationLink: string,
  clientName: string,
  coachName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #10b981; margin: 0; font-size: 32px;">Vexlon</h1>
          <p style="color: #a1a1a1; margin: 8px 0 0 0;">Professional Coaching Platform</p>
        </div>

        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #000000; margin: 0 0 16px 0;">Verify Your New Email Address</h2>

          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${clientName},
          </p>

          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            ${coachName} has requested to change your email address on Vexlon. Click the button below to confirm this change.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #9ca3af; margin: 0 0 20px 0; word-break: break-all; font-size: 12px;">
            ${verificationLink}
          </p>

          <p style="color: #9ca3af; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px;">
            This link expires in 24 hours. If you did not request this change, please ignore this email or contact your coach.
          </p>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Verify Your Email Change on Vexlon',
      html: emailHtml,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email service error:', err)
    return { success: false, error: String(err) }
  }
}
