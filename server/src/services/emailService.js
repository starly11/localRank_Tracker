import nodemailer from 'nodemailer';

let cachedTransporter = null;

export const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => {
  if (!isEmailConfigured()) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_PORT) === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter || !to) return { skipped: true };

  const from = process.env.EMAIL_FROM || `Local Rank Tracker <${process.env.EMAIL_USER}>`;
  await transporter.sendMail({ from, to, subject, html });
  return { sent: true };
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Reset your password</h2>
      <p>Use the link below to reset your password. This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset your Local Rank Tracker password',
    html,
  });
};

export const sendNegativeReviewAlertEmail = async ({ to, businessName, rating, reviewerName, excerpt }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>New Negative Review</h2>
      <p><strong>${businessName}</strong> received a <strong>${rating}-star</strong> review.</p>
      <p><em>${excerpt || 'No excerpt available.'}</em> - ${reviewerName || 'Anonymous'}</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Negative review alert for ${businessName}`,
    html,
  });
};

export const sendWeeklyDigestEmail = async ({ to, name, digest }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Weekly Review Digest</h2>
      <p>Hello ${name || 'there'}, here is your weekly update.</p>
      ${digest}
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Your weekly Local Rank Tracker digest',
    html,
  });
};
