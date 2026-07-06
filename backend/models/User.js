const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
    },

  email: {
  type: String,
  required: true,
  unique: true,
  index: true,
},

phoneNumber: {
  type: String,
  required: true,
  unique: true,
  index: true,
},

   password: {
  type: String,
  required: true,
  select: false,

    },

    role: {
      type: String,
      enum: ["admin", "wholesale", "retail"],
      default: "retail",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    // Login OTP
    loginOtp: {
      type: String,
      default: null,
    },

    loginOtpExpire: {
      type: Date,
      default: null,
    },

    // Forgot Password OTP
    resetPasswordOtp: {
      type: String,
      default: null,
    },

    resetPasswordOtpExpire: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  // Only hash password if it has been modified
  if (!this.isModified("password")) {
    return;
  }

  // Prevent double hashing
  if (
    this.password.startsWith("$2a$") ||
    this.password.startsWith("$2b$")
  ) {
    return;
  }

  // Generate salt
  const salt = await bcrypt.genSalt(10);

  // Hash password
  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

userSchema.methods.matchPassword =
  async function (enteredPassword) {
    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

module.exports = mongoose.model("User", userSchema);