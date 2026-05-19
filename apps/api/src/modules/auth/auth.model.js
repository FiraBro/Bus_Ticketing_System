import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Schema Definition
// ---------------------------------------------------------------------------

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name."],
      trim: true,
      maxlength: [60, "Name must not exceed 60 characters."],
    },

    email: {
      type: String,
      required: [true, "A user must have an email address."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },

    password: {
      type: String,
      required: [true, "A user must have a password."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },

    role: {
      type: String,
      enum: ["passenger", "operator", "admin"],
      default: "passenger",
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    // -----------------------------------------------------------------------
    // Email Verification
    // -----------------------------------------------------------------------

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: String,

    emailVerifyExpire: Date,

    // -----------------------------------------------------------------------
    // Password Reset
    // -----------------------------------------------------------------------

    resetPasswordToken: String,

    resetPasswordExpire: Date,

    // -----------------------------------------------------------------------
    // Login Protection
    // -----------------------------------------------------------------------

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

userSchema.index({ role: 1, active: 1 });

// ---------------------------------------------------------------------------
// Password Hashing
// ---------------------------------------------------------------------------
// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 12);
// });
// Change your password hashing block to look exactly like this:
// ---------------------------------------------------------------------------
// Password Hashing (Modern Async Syntax)
// ---------------------------------------------------------------------------
userSchema.pre("save", async function () {
  // If the password wasn't modified, do nothing and return out of the async execution block
  if (!this.isModified("password")) return;

  // Hash the password directly onto the document
  this.password = await bcrypt.hash(this.password, 12);
});

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// ---------------------------------------------------------------------------
// Email Verification Token
// ---------------------------------------------------------------------------

userSchema.methods.createEmailVerifyToken = function () {
  const verifyToken = crypto.randomBytes(32).toString("hex");

  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  this.emailVerifyExpire = Date.now() + 10 * 60 * 1000;

  return verifyToken;
};

// ---------------------------------------------------------------------------
// Password Reset Token
// ---------------------------------------------------------------------------

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// ---------------------------------------------------------------------------
// Login Attempts
// ---------------------------------------------------------------------------

userSchema.methods.incrementLoginAttempts = async function (
  maxAttempts,
  lockTimeMs,
) {
  this.loginAttempts += 1;

  if (this.loginAttempts >= maxAttempts) {
    this.lockUntil = Date.now() + lockTimeMs;
  }

  await this.save({
    validateBeforeSave: false,
  });
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;

  await this.save({
    validateBeforeSave: false,
  });
};

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

const User = mongoose.model("User", userSchema);

export default User;
