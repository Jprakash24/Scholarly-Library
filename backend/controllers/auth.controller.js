const jwt       = require('jsonwebtoken')
const crypto    = require('crypto')
const { validationResult } = require('express-validator')
const User      = require('../models/User')

/* ── helpers ──────────────────────────────────────────── */

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function verifyEmailHtml(name, link) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;max-width:520px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e1a14 0%,#2a2218 100%);padding:32px 40px;text-align:center;border-bottom:1px solid #2a2a2a;">
            <div style="font-size:28px;margin-bottom:8px;">📚</div>
            <h1 style="margin:0;color:#e9c176;font-size:22px;font-weight:700;letter-spacing:0.5px;">Scholarly Library</h1>
            <p style="margin:6px 0 0;color:#8a7a60;font-size:13px;">Email Verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;color:#c8c0b0;font-size:15px;line-height:1.6;">Hi <strong style="color:#e9c176;">${name}</strong>,</p>
            <p style="margin:0 0 20px;color:#c8c0b0;font-size:15px;line-height:1.6;">
              Thank you for creating an account. Click the button below to verify your email and activate your library access.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${link}" style="display:inline-block;background:#e9c176;color:#1a1a1a;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Verify Email Address</a>
            </div>
            <p style="margin:0 0 12px;color:#6a6a6a;font-size:13px;line-height:1.6;">Or copy and paste this link into your browser:</p>
            <p style="margin:0 0 20px;word-break:break-all;color:#8a7a60;font-size:12px;">${link}</p>
            <p style="margin:0;color:#6a6a6a;font-size:13px;">This link expires in <strong style="color:#c8c0b0;">24 hours</strong>. If you did not create an account, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#111;padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;color:#4a4a4a;font-size:12px;">© Scholarly Library · This is an automated message, please do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function otpEmailHtml(code) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;max-width:520px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1a14 0%,#2a2218 100%);padding:32px 40px;text-align:center;border-bottom:1px solid #2a2a2a;">
            <div style="font-size:28px;margin-bottom:8px;">📚</div>
            <h1 style="margin:0;color:#e9c176;font-size:22px;font-weight:700;letter-spacing:0.5px;">Scholarly Library</h1>
            <p style="margin:6px 0 0;color:#8a7a60;font-size:13px;">Password Verification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;color:#c8c0b0;font-size:15px;line-height:1.6;">
              You requested to change your password. Use the code below to verify your identity. It expires in <strong style="color:#e9c176;">10 minutes</strong>.
            </p>

            <!-- OTP box -->
            <div style="background:#111;border:1px solid #3a3020;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
              <p style="margin:0 0 8px;color:#8a7a60;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
              <div style="font-size:38px;font-weight:700;letter-spacing:12px;color:#e9c176;font-family:'Courier New',monospace;">${code}</div>
            </div>

            <p style="margin:0 0 16px;color:#6a6a6a;font-size:13px;line-height:1.6;">
              If you did not request a password change, you can safely ignore this email — your account remains secure.
            </p>
            <p style="margin:0;color:#6a6a6a;font-size:13px;">
              Do not share this code with anyone.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#111;padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;color:#4a4a4a;font-size:12px;">© Scholarly Library · This is an automated message, please do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendEmail({ to, subject, text, html }) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        family: 4, // force IPv4 — Render free tier cannot reach SMTP via IPv6
      })
      await transporter.sendMail({
        from: `"Scholarly Library" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      })
      return { sent: true }
    } catch (err) {
      console.error('Email delivery failed (non-fatal):', err.message)
      return { sent: false }
    }
  }
  // Dev fallback — caller logs the OTP to the console
  console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${text}\n`)
  return { sent: false }
}

/* ── POST /api/auth/signup ──────────────────────────── */
async function signup(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { name, email, password } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, role: 'user' })

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.emailVerifyToken  = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}`
    if (!process.env.FRONTEND_URL) console.warn('WARNING: FRONTEND_URL not set — verify link points to localhost')
    const result = await sendEmail({
      to:      user.email,
      subject: 'Scholarly Library — Verify your email address',
      text:    `Hi ${user.name},\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
      html:    verifyEmailHtml(user.name, verifyUrl),
    })

    const payload = { message: 'Account created. Please check your email to verify your account.' }
    if (!result.sent) payload.devToken = rawToken
    res.status(201).json(payload)
  } catch (err) {
    next(err)
  }
}

/* ── POST /api/auth/login ──────────────────────────── */
async function login(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (user.isEmailVerified === false) {
      return res.status(403).json({ message: 'Please verify your email before logging in. Check your inbox for the verification link.', code: 'EMAIL_NOT_VERIFIED' })
    }
    if (user.suspended) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact the library.' })
    }
    if (user.isDeactivated) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact the library to restore it.' })
    }
    res.json({ token: signToken(user._id), user })
  } catch (err) {
    next(err)
  }
}

/* ── GET /api/auth/me ──────────────────────────────── */
async function me(req, res, next) {
  try {
    res.json(req.user)
  } catch (err) {
    next(err)
  }
}

/* ── PATCH /api/auth/profile ───────────────────────── */
async function updateProfile(req, res, next) {
  try {
    const { name, picture, phone, department, course, year, bio } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, picture, phone, department, course, year, bio },
      { new: true, runValidators: true }
    )
    res.json(user)
  } catch (err) {
    next(err)
  }
}

/* ── POST /api/auth/otp  (send OTP to logged-in user) ─ */
async function sendOtp(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    // Enforce 60-second cooldown between resends
    if (user.otpExpiry && user.otpExpiry > new Date(Date.now() + 9 * 60 * 1000)) {
      return res.status(429).json({ message: 'Please wait 60 seconds before requesting a new code.' })
    }

    const code   = genOtp()
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    user.otpCode   = crypto.createHash('sha256').update(code).digest('hex')
    user.otpExpiry = expiry
    await user.save({ validateBeforeSave: false })

    const result = await sendEmail({
      to:      user.email,
      subject: 'Scholarly Library — Your verification code',
      text:    `Your one-time verification code is: ${code}\n\nThis code expires in 10 minutes.\nIf you did not request this, please ignore this email.`,
      html:    otpEmailHtml(code),
    })

    // In dev mode (no SMTP), return the code so the developer can use it
    const payload = { message: 'Verification code sent to your email.' }
    if (!result.sent) payload.devOtp = code   // remove this line before deploying to production

    res.json(payload)
  } catch (err) {
    next(err)
  }
}

/* ── PATCH /api/auth/password  (verify OTP + set new pw) */
async function changePassword(req, res, next) {
  try {
    const { otp, newPassword } = req.body
    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'OTP and new password are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const user = await User.findById(req.user._id)
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')

    if (!user.otpCode || user.otpCode !== hashedOtp) {
      return res.status(400).json({ message: 'Invalid verification code.' })
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' })
    }

    user.password  = newPassword
    user.otpCode   = null
    user.otpExpiry = null
    await user.save()

    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    next(err)
  }
}

/* ── GET /api/auth/verify-email?token=xxx ─────────── */
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ message: 'Verification token is required.' })

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      emailVerifyToken:  hashedToken,
      emailVerifyExpiry: { $gt: new Date() },
    })

    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' })

    user.isEmailVerified   = true
    user.emailVerifyToken  = null
    user.emailVerifyExpiry = null
    await user.save({ validateBeforeSave: false })

    res.json({ token: signToken(user._id), user })
  } catch (err) {
    next(err)
  }
}

/* ── POST /api/auth/resend-verify ─────────────────── */
async function resendVerify(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required.' })

    const user = await User.findOne({ email: email.toLowerCase() })
    // Always respond the same way to avoid user enumeration
    if (!user || user.isEmailVerified) {
      return res.json({ message: 'If that email exists and is unverified, a new link has been sent.' })
    }

    // 2-minute cooldown: expiry > (now + 23h58m) means sent less than 2 min ago
    if (user.emailVerifyExpiry && user.emailVerifyExpiry > new Date(Date.now() + 86280000)) {
      return res.status(429).json({ message: 'Please wait a moment before requesting another link.' })
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.emailVerifyToken  = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}`
    if (!process.env.FRONTEND_URL) console.warn('WARNING: FRONTEND_URL not set — verify link points to localhost')
    const result = await sendEmail({
      to:      user.email,
      subject: 'Scholarly Library — Verify your email address',
      text:    `Hi ${user.name},\n\nNew verification link: ${verifyUrl}\n\nExpires in 24 hours.`,
      html:    verifyEmailHtml(user.name, verifyUrl),
    })

    const payload = { message: 'Verification email sent. Please check your inbox.' }
    if (!result.sent) payload.devToken = rawToken
    res.json(payload)
  } catch (err) {
    next(err)
  }
}

/* ── PATCH /api/auth/deactivate ────────────────────── */
async function deactivateAccount(req, res, next) {
  try {
    const { confirmEmail } = req.body
    const user = await User.findById(req.user._id)

    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({ message: 'Email confirmation does not match your account email.' })
    }

    user.isDeactivated = true
    await user.save({ validateBeforeSave: false })

    res.json({ message: 'Account deactivated. You have been logged out.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { signup, login, me, updateProfile, sendOtp, changePassword, deactivateAccount, verifyEmail, resendVerify }
