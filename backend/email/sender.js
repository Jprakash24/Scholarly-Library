const nodemailer = require('nodemailer')

async function sendViaBrevo({ to, subject, html, text }) {
  const key = process.env.BREVO_API_KEY
  if (!key) return false
  const sender = { name: 'Scholarly Library', email: process.env.SMTP_USER || process.env.BREVO_SENDER }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html, textContent: text }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || JSON.stringify(data))
  return true
}

async function sendViaSmtp({ to, subject, html, text }) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return false
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  const from = `Scholarly Library <${SMTP_USER}>`
  await transporter.sendMail({ from, to, subject, html, text })
  return true
}

async function sendEmail({ to, subject, html, text }) {
  // 1. Try Brevo HTTP API (works on Render, no domain needed)
  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevo({ to, subject, html, text })
      console.log(`[EMAIL] Sent via Brevo to ${to}`)
      return { sent: true }
    } catch (err) {
      console.error(`[EMAIL] Brevo failed — ${err.message}`)
      return { sent: false, reason: err.message }
    }
  }

  // 2. Fallback: Gmail SMTP (works locally)
  if (process.env.SMTP_HOST) {
    try {
      await sendViaSmtp({ to, subject, html, text })
      console.log(`[EMAIL] Sent via SMTP to ${to}`)
      return { sent: true }
    } catch (err) {
      console.error(`[EMAIL] SMTP failed — ${err.message}`)
      return { sent: false, reason: err.message }
    }
  }

  console.log(`[EMAIL] No email service configured — skipped for ${to}`)
  return { sent: false, reason: 'no_smtp' }
}

module.exports = { sendEmail }
