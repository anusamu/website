const nodemailer = require("nodemailer");

const sendMail = async (
  to,
  subject,
  html
) => {
  try {
    const transporter =
      nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

    const mailOptions = {
      from: `"RAJAGOPAL HANDLOOMS" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Email Sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Email Send Error:",
      error
    );
    throw error;
  }
};

module.exports = sendMail;