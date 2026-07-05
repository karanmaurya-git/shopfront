const nodemailer = require('nodemailer');

let transporter = null;

const isEmailConfigured = () =>
  !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => {
  if (!transporter && isEmailConfigured()) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

// Sends an email if EMAIL_* env vars are configured; silently no-ops (with a log) otherwise.
// Never throws — a failed/unconfigured email should never break an order or registration.
const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.log(`[email skipped — not configured] Would have sent "${subject}" to ${to}`);
    return { sent: false };
  }
  try {
    const t = getTransporter();
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { sent: false, error: error.message };
  }
};

module.exports = sendEmail;
