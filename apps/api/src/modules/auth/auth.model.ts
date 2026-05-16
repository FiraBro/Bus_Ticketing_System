import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../../config/env";

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "passenger" | "operator" | "admin";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  // Hashed refresh token — null when logged out
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
  compareRefreshToken(candidate: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, object, IUser> &
  IUser &
  IUserMethods;

export interface UserModel extends Model<IUser, object, IUserMethods> {
  // Static methods go here if needed later
}

// ── Schema ─────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      // Never expose the hash in query results by default
      select: false,
    },
    role: {
      type: String,
      enum: ["passenger", "operator", "admin"] satisfies UserRole[],
      default: "passenger",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    // Exclude sensitive fields from toJSON / toObject by default
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret["passwordHash"];
        delete ret["refreshTokenHash"];
        delete ret["__v"];
        return ret;
      },
    },
  },
);

// ── Instance Methods ───────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.compareRefreshToken = async function (
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  if (!this.refreshTokenHash) return false;
  return bcrypt.compare(candidate, this.refreshTokenHash);
};

// ── Pre-save Hook ──────────────────────────────────────────────────────────
// Hash happens in the service — the model stays thin and predictable.
// Avoid putting business logic in hooks; it makes testing harder.

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
