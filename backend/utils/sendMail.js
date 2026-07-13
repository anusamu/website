const nodemailer = require("nodemailer");

const mailHost = process.env.MAIL_HOST;
const mailPort = Number(process.env.MAIL_PORT) || 2525;
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const mailFrom = process.env.MAIL_FROM || mailUser;

if (!mailHost || !mailUser || !mailPass || !mailFrom) {
  throw new Error(
    "Missing required mail environment variables: MAIL_HOST, MAIL_USER, MAIL_PASS, MAIL_FROM"
  );
}

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: mailPort === 465,
  auth: {
    user: mailUser,
    pass: mailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify().then(() => {
  console.log("✅ Mail transporter configured and verified");
}).catch((err) => {
  console.error("❌ Mail transporter verification failed:", err);
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"RAJAGOPAL HANDLOOMS" <${mailFrom}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw error;
  }
};

module.exports = sendMail;