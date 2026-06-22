const API_KEY = () => process.env.RESEND_API_KEY || process.env.RESEND_API_URL

async function sendEmail({ to, subject, html, text }) {
  const key = API_KEY()
  if (!key) {
    console.log(`[EMAIL] No Resend API key configured — skipped for ${to}`)
    return { sent: false, reason: 'no_api_key' }
  }
  try {
    const from = process.env.EMAIL_FROM || 'Scholarly Library <onboarding@resend.dev>'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || JSON.stringify(data))
    console.log(`[EMAIL] Sent to ${to} — "${subject}"`)
    return { sent: true }
  } catch (err) {
    console.error(`[EMAIL] Failed to ${to} — ${err.message}`)
    return { sent: false, reason: err.message }
  }
}

module.exports = { sendEmail }
