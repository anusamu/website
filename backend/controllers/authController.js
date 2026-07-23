                                                                                  const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendMail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizePhoneNumber = (value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    } = req.body;

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const exists = await User.exists({
      $or: [
        { email },
        ...(normalizedPhoneNumber ? [{ phoneNumber: normalizedPhoneNumber }] : []),
      ],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    await User.create({
      firstName,
      lastName,
      email,
      phoneNumber: normalizedPhoneNumber,
      password, // schema will hash it
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please login.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account did not return an email",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: given_name || "Google User",
        lastName: family_name || "",
        email,
        password: Math.random().toString(36).slice(2),
        isVerified: true,
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const authToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: authToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.verifyRegisterOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     if (
//       user.emailOtp !== otp ||
//       user.emailOtpExpire < Date.now()
//     ) {
//       return res.status(400).json({
//         message: "Invalid OTP",
//       });
//     }

//     user.isVerified = true;
//     user.emailOtp = undefined;
//     user.emailOtpExpire = undefined;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Account verified",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and Password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phoneNumber: emailOrPhone },
      ],
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.loginOtp = otp;
    user.loginOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const emailHtml = `
    <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Login OTP Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
            <td > <tr> <!-- Logo --> </td>
              <td align="center" style="background:#4f8053;padding:25px;">
               <h1 style="
  color:#ffffff;
  margin:0;
  font-size:38px;
  font-family:Georgia, serif;
  font-weight:bold;
  letter-spacing:3px;
  text-shadow:1px 1px 3px rgba(0,0,0,0.3);
">
  <img src="https://i.postimg.cc/KYXPMBRR/Rajagopal-handloom.png" alt="Rajagopal Handlooms Logo" width="80" height="80" style="display:block;border-radius:50%;" /> RAJAGOPAL HANDLOOMS
</h1> 
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 30px;">
                <h2 style="color:#333333;margin-top:0;">
                  Hello ${user.firstName},
                </h2>

                <p style="font-size:16px;color:#555555;line-height:1.6;">
                  We received a request to log in to your Rajagopal Handlooms account.
                  Please use the One-Time Password (OTP) below to verify your identity.
                </p>

                <div style="text-align:center;margin:30px 0;">
                  <div style="
                    display:inline-block;
                    background:#f5f5f5;
                    border:2px dashed #4f8053;
                    padding:15px 40px;
                    font-size:32px;
                    font-weight:bold;
                    color:#4f8053;
                    letter-spacing:5px;
                    border-radius:8px;
                  ">
                    ${otp}
                  </div>
                </div>

                <p style="font-size:15px;color:#555555;">
                  ⏳ This OTP is valid for <strong>10 minutes</strong>.
                </p>

                <p style="font-size:15px;color:#555555;">
                  If you did not request this login, please ignore this email or contact our support team immediately.
                </p>

                <p style="margin-top:30px;color:#333333;">
                  Regards,<br />
                  <strong>Rajagopal Handlooms Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background:#f8f8f8;padding:20px;color:#777777;font-size:13px;">
                © ${new Date().getFullYear()} Rajagopal Handlooms. All Rights Reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

    sendMail(
      user.email,
      "Rajagopal Handlooms - Login OTP Verification",
      emailHtml
    ).catch((err) => {
      console.error("OTP email send error:", err);
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.loginOtp !== otp ||
      user.loginOtpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    user.loginOtp = undefined;
    user.loginOtpExpire = undefined;
    user.lastLogin = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSavedAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedAddress');

    if (!user || !user.savedAddress) {
      return res.status(200).json({
        success: false,
        message: 'No saved address found.',
        address: null,
      });
    }

    res.status(200).json({
      success: true,
      address: user.savedAddress,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};