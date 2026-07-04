function userDeactivateHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;max-width:520px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#1e1a14 0%,#2a2218 100%);padding:32px 40px;text-align:center;border-bottom:1px solid #2a2a2a;">
            <div style="font-size:32px;margin-bottom:10px;">📚</div>
            <h1 style="margin:0;color:#e9c176;font-size:22px;font-weight:700;letter-spacing:0.5px;">Scholarly Library</h1>
            <p style="margin:6px 0 0;color:#8a7a60;font-size:13px;">Account Deactivate Successfully</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;color:#c8c0b0;font-size:15px;line-height:1.6;">
              Your account has been successfully deactivated. Thank you for being with us.
               We hope to welcome you back in the future.
            </p>

            // <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            //   <tr>
            //     <td style="border-radius:12px;background:#e9c176;">
            //       <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;padding:14px 36px;color:#111;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;">Log In</a>
            //     </td>
            //   </tr>
            // </table>

            <p style="margin:0;color:#6a6a6a;font-size:13px;line-height:1.6;">
              If you did not request this change, please contact support or change your password immediately.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#111;padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;color:#4a4a4a;font-size:12px;">© Scholarly Library · Automated message — do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

module.exports = { userDeactivateHtml }
