/**
 * Email Service
 *
 * Provides email sending capabilities via Nodemailer.
 * In development, logs email content to the console if credentials are missing.
 *
 * OWASP Top 10 relevance:
 *   A07:2021 – Identification and Authentication Failures
 */

const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Creates a Nodemailer transporter if email credentials are configured.
 *
 * @returns {object|null} Nodemailer transporter or null
 */
const createTransporter = () => {
  if (!env.isEmailConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

/**
 * Sends an email.
 *
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @returns {Promise<object>} Send result
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  };

  if (!transporter) {
    logger.info("Email not sent (no transporter configured)", {
      to,
      subject,
    });
    return { messageId: null, preview: mailOptions };
  }

  return transporter.sendMail(mailOptions);
};

/**
 * Sends an email verification code.
 *
 * @param {string} to - Recipient email
 * @param {string} username - User's username
 * @param {string} code - Verification code
 * @returns {Promise<object>} Send result
 */
const sendVerificationEmail = (to, username, code) => {
  return sendEmail({
    to,
    subject: "Verify your JAIWA Team account",
    html: `
    <div style="
        max-width:600px;
        margin:60px auto;
        background:#ffffff;
        border:1px solid #e5e5e5;
        border-radius:11px;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
        color:#111827;
        overflow:hidden;
    ">
        <div style="
            padding:32px;
            text-align: left;
            border-bottom:1px solid #f0f0f0;
        ">
            <h1 style="
                margin:0;
                font-size:21px;
                font-weight:700;
                color:#111827;
            ">
                JAIWA Team
            </h1>

            <p style="
                margin-top:10px;
                color:#6b7280;
                font-size:16px;
            ">
                Verify your email address
            </p>
        </div>

        <div style="padding:30px;">

            <h2 style="
                margin-top:0;
                font-size:21px;
                color:#111827;
            ">
                Hello ${username} 
            </h2>

            <p style="
                font-size:1rem;
                line-height:18px;
                color:#374151;
                text-align: left;
            ">
                Welcome to <strong>JAIWA Team</strong>!
                <br><br>
                We're excited to have you here.
            </p>

            <p style="
                margin-top:50px;
                font-size:1rem;
                color:#374151;
            ">
                Use the verification code below to activate your account.
            </p>

            <div style="
                margin:35px auto;
                width:260px;
                background:#f8fafc;
                border-radius:11px;
                padding:22px;
                text-align:center;
            ">
                <h2 style="
                    font-size:21px;
                    letter-spacing:10px;
                    font-weight:700;
                    color:#55668d;
                ">
                    ${code}
                </h2>
            </div>

            <p style="
                text-align:center;
                font-size:1rem;
                color:#6b7280;
            ">
                This code expires in
                <strong>10 minutes</strong>.
            </p>

            <hr style="
                border:none;
                border-top:1px solid #e5e5e5;
                margin:40px 0;
            ">

            <p style="
                color:#6b7280;
                font-size:1rem;
                line-height:21px;
                text-align: left;
            ">
                If you didn't create a JAIWA Team account,
                you can safely ignore this email.
            </p>

            <div style="
                margin-top:21px;
                text-align:left;
            ">
                <p style="
                    margin:0;
                    color:#111827;
                    font-weight:400;
                ">
                    To learn more about JAIWA Team, visit our website: jaiwateam.com
                </p>

            </div>

        </div>

        <div style="
            background:#f9fafb;
            text-align:center;
            padding:20px;
            color:#9ca3af;
            font-size:11px;
        ">
            © 2026 JAIWA Team
        </div>

    </div>
`
    ,
  });
};

/**
 * Sends a password reset code.
 *
 * @param {string} to - Recipient email
 * @param {string} username - User's username
 * @param {string} code - Reset code
 * @returns {Promise<object>} Send result
 */
const sendPasswordResetEmail = (to, username, code) => {
  return sendEmail({
    to,
    subject: "Reset your JAIWA Team password",
    html: `
      <h2>Hello ${username},</h2>
      <p>You requested a password reset. Enter the code below to continue:</p>
      <h1>${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};

/**
 * Sends an email change verification code.
 *
 * @param {string} to - Recipient email
 * @param {string} username - User's username
 * @param {string} code - Verification code
 * @returns {Promise<object>} Send result
 */
const sendEmailChangeCode = (to, username, code) => {
  return sendEmail({
    to,
    subject: "Verify your new JAIWA Team email",
    html: `
      <h2>Hello ${username},</h2>
      <p>Your email change verification code is:</p>
      <h1>${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeCode,
};
