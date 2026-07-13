const nodemailer = require("nodemailer");

const useBrevo = Boolean(process.env.BREVO_EMAIL && process.env.BREVO_SMTP_KEY);
const mailHost = useBrevo
  ? process.env.MAIL_HOST || "smtp-relay.brevo.com"
  : process.env.MAIL_HOST;
const mailPort = Number(process.env.MAIL_PORT) || 2525;
const mailUser = useBrevo ? process.env.BREVO_EMAIL : process.env.MAIL_USER;
const mailPass = useBrevo ? process.env.BREVO_SMTP_KEY : process.env.MAIL_PASS;
const mailFrom = process.env.MAIL_FROM || mailUser;

if (!mailHost || !mailUser || !mailPass || !mailFrom) {
  throw new Error(
    "Missing required mail environment variables: " +
      (useBrevo
        ? "BREVO_EMAIL, BREVO_SMTP_KEY, MAIL_FROM"
        : "MAIL_HOST, MAIL_USER, MAIL_PASS, MAIL_FROM")
  );
}

const providerName = useBrevo ? "Brevo" : mailHost;
const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: mailPort === 465,
  auth: {
    user: mailUser,
    pass: mailPass,
  },
  family: 4,
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

if (process.env.NODE_ENV !== "production") {
  transporter.verify().then(() => {
    console.log(`✅ Mail transporter configured and verified (${providerName})`);
  }).catch((err) => {
    console.warn(`⚠️ Mail transporter verification warning (${providerName}):`, err.message || err);
  });
}

if (process.env.NODE_ENV !== "production") {
  transporter.verify().then(() => {
    console.log("✅ Mail transporter configured and verified");
  }).catch((err) => {
    console.warn("⚠️ Mail transporter verification warning:", err.message || err);
  });
}

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