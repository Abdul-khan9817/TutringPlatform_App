import { Resend } from 'resend'
import { logger } from './logger'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string }> {
  const from = process.env.EMAIL_FROM ?? 'WorkSpeak Portugal <hello@workspeakportugal.com>'

  try {
    const result = await getResend().emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo,
    })

    if (result.error) {
      logger.error('Email send failed', { error: result.error, subject: payload.subject })
      return { success: false }
    }

    logger.info('Email sent', { id: result.data?.id, subject: payload.subject })
    return { success: true, id: result.data?.id }
  } catch (error) {
    logger.error('Email send exception', {
      error: error instanceof Error ? error.message : 'unknown',
      subject: payload.subject,
    })
    return { success: false }
  }
}

// ─── Email templates (simple HTML, no React Email dependency required) ────────

export function assessmentConfirmationEmail(data: {
  name: string
  language: string
  preferredDate?: string
}) {
  return {
    subject: 'Assessment Request Received — WorkSpeak Portugal',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">WorkSpeak Portugal</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e3a8a; margin-top: 0;">Assessment Request Received</h2>
    <p>Dear ${data.name},</p>
    <p>Thank you for your interest in <strong>${data.language} lessons</strong> at WorkSpeak Portugal. We have received your free assessment request and will be in touch shortly.</p>
    ${data.preferredDate ? `<p>Your preferred date: <strong>${data.preferredDate}</strong></p>` : ''}
    <p>We will contact you within 1 business day to confirm your free 15-minute assessment.</p>
    <p style="margin-top: 32px;">Best regards,<br><strong>WorkSpeak Portugal Team</strong></p>
  </div>
  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
    WorkSpeak Portugal · <a href="https://workspeakportugal.com" style="color: #94a3b8;">workspeakportugal.com</a>
  </p>
</body>
</html>`,
  }
}

export function bookingConfirmationEmail(data: {
  studentName: string
  service: string
  startAt: string
  deliveryMode: string
  meetingLink?: string
}) {
  return {
    subject: 'Booking Confirmed — WorkSpeak Portugal',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">WorkSpeak Portugal</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e3a8a; margin-top: 0;">Booking Confirmed ✓</h2>
    <p>Dear ${data.studentName},</p>
    <p>Your lesson has been confirmed.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Service</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>${data.service}</strong></td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Date &amp; Time</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>${data.startAt}</strong></td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Format</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>${data.deliveryMode}</strong></td></tr>
      ${data.meetingLink ? `<tr><td style="padding: 8px; color: #64748b;">Meeting Link</td><td style="padding: 8px;"><a href="${data.meetingLink}" style="color: #2563eb;">${data.meetingLink}</a></td></tr>` : ''}
    </table>
    <p>See you at your lesson!</p>
    <p style="margin-top: 32px;">Best regards,<br><strong>WorkSpeak Portugal Team</strong></p>
  </div>
</body>
</html>`,
  }
}

export function passwordResetEmail(data: { name: string; resetUrl: string }) {
  return {
    subject: 'Reset Your Password — WorkSpeak Portugal',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">WorkSpeak Portugal</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e3a8a; margin-top: 0;">Password Reset Request</h2>
    <p>Dear ${data.name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.resetUrl}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset Password</a>
    </div>
    <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    <p style="margin-top: 32px;">Best regards,<br><strong>WorkSpeak Portugal Team</strong></p>
  </div>
</body>
</html>`,
  }
}

export function emailVerificationEmail(data: { name: string; verifyUrl: string }) {
  return {
    subject: 'Verify Your Email — WorkSpeak Portugal',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">WorkSpeak Portugal</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e3a8a; margin-top: 0;">Verify Your Email Address</h2>
    <p>Dear ${data.name},</p>
    <p>Welcome to WorkSpeak Portugal! Please verify your email address to activate your account.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.verifyUrl}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">Verify Email</a>
    </div>
    <p style="color: #64748b; font-size: 14px;">This link expires in 24 hours.</p>
    <p style="margin-top: 32px;">Best regards,<br><strong>WorkSpeak Portugal Team</strong></p>
  </div>
</body>
</html>`,
  }
}

export function paymentConfirmationEmail(data: {
  studentName: string
  amount: string
  description: string
}) {
  return {
    subject: 'Payment Confirmed — WorkSpeak Portugal',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">WorkSpeak Portugal</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1e3a8a; margin-top: 0;">Payment Confirmed ✓</h2>
    <p>Dear ${data.studentName},</p>
    <p>Your payment of <strong>${data.amount}</strong> for <strong>${data.description}</strong> has been received successfully.</p>
    <p>You can view your payment history and booking details in your student dashboard.</p>
    <p style="margin-top: 32px;">Best regards,<br><strong>WorkSpeak Portugal Team</strong></p>
  </div>
</body>
</html>`,
  }
}
