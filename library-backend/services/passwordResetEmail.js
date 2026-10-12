const nodemailer = require('nodemailer');

function mailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw Object.assign(new Error('Password-reset email is not configured.'), { status: 503 });
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: (Number(SMTP_PORT) || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendPasswordResetEmail(email, code) {
  const from = process.env.PASSWORD_RESET_FROM || process.env.SMTP_USER;
  await mailer().sendMail({
    from: `LibraReserve <${from}>`,
    to: email,
    subject: 'Your LibraReserve password reset code',
    text: `Use this code to reset your LibraReserve password: ${code}\n\nIt expires in 15 minutes. If you did not request this, you can ignore this email.`,
  });
}

module.exports = { sendPasswordResetEmail };
