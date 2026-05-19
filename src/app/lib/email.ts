import 'server-only'

import { Resend } from 'resend'

const SENDER = 'MasterPet <onboarding@resend.dev>'

let cached: Resend | null = null

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!cached) cached = new Resend(key)
  return cached
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type TenantApprovedEmailInput = {
  to: string
  ownerName: string
  tenantName: string
  magicLink: string
}

export async function sendTenantApprovedEmail(
  input: TenantApprovedEmailInput
): Promise<{ sent: boolean; error?: string }> {
  const client = getClient()
  if (!client) {
    console.warn('[email] RESEND_API_KEY missing — skipping tenant approval email', {
      to: input.to,
    })
    return { sent: false, error: 'missing_api_key' }
  }

  const ownerName = escapeHtml(input.ownerName || 'בעל העסק')
  const tenantName = escapeHtml(input.tenantName)
  const link = input.magicLink

  const html = `<!doctype html>
<html lang="he" dir="rtl">
  <head><meta charset="utf-8" /><title>החשבון שלך אושר</title></head>
  <body style="font-family: -apple-system, 'Segoe UI', Arial, sans-serif; background:#f6f7f9; margin:0; padding:32px 16px;">
    <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:12px; padding:32px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h1 style="font-size:22px; margin:0 0 16px; color:#111;">ברוכים הבאים ל-MasterPet 🎉</h1>
      <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 12px;">שלום ${ownerName},</p>
      <p style="font-size:16px; line-height:1.6; color:#333; margin:0 0 16px;">
        החשבון של <strong>${tenantName}</strong> אושר ופעיל במערכת.
        אפשר להיכנס עכשיו עם הקישור הבא:
      </p>
      <p style="text-align:center; margin:28px 0;">
        <a href="${link}" style="display:inline-block; background:#2563eb; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:16px;">כניסה למערכת</a>
      </p>
      <p style="font-size:14px; line-height:1.6; color:#666; margin:0 0 8px;">הקישור תקף לשעה אחת בלבד. אם הוא פג תוקף, אפשר לבקש קישור חדש בכניסה למערכת.</p>
      <p style="font-size:13px; line-height:1.6; color:#888; margin:24px 0 0;">לא ביקשת את ההרשמה? אפשר להתעלם מהמייל הזה.</p>
      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
      <p style="font-size:12px; color:#999; margin:0;">צוות MasterPet</p>
    </div>
  </body>
</html>`

  const text = `שלום ${input.ownerName || 'בעל העסק'},

החשבון של ${input.tenantName} אושר ופעיל במערכת.
כניסה למערכת: ${link}

הקישור תקף לשעה אחת.

צוות MasterPet`

  try {
    const { error } = await client.emails.send({
      from: SENDER,
      to: input.to,
      subject: 'החשבון שלך ב-MasterPet אושר',
      html,
      text,
    })
    if (error) {
      console.error('[email] resend.send returned error', error)
      return { sent: false, error: error.message }
    }
    return { sent: true }
  } catch (err) {
    console.error('[email] resend.send threw', err)
    return { sent: false, error: 'send_threw' }
  }
}
