import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface MessagingPreferences {
  allowDirectMessages: boolean;
  blockedCommunities: string[]; // Array of community IDs where messaging is blocked
}

interface PaymentSettings {
  razorpayCustomerId?: string;
  razorpayAccountId?: string; // For community admins who can receive payments
  subscriptionId?: string;
  subscriptionStatus?: "active" | "canceled" | "past_due" | "unpaid" | "trial";
  subscriptionEndDate?: Date;
  enablePayments?: boolean; // For community admins to enable/disable payments
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  name?: string;
  email: string;
  password?: string;
  provider?: string;
  providerId?: string;
  providerType?: string;
  slug?: string;
  createdAt: Date;
  firstName?: string;
  lastName?: string;
  timezone?: string;
  notificationSettings?: NotificationSettings;
  messagingPreferences?: MessagingPreferences;
  paymentSettings?: PaymentSettings;
  community: mongoose.Types.ObjectId[];
  followedBy: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  profileImage?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  role?: "user" | "admin" | "platform_admin";
}

const userSchema = new mongoose.Schema<IUser>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    provider: { type: String },
    providerId: { type: String },
    providerType: { type: String },
    slug: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
    firstName: { type: String },
    lastName: { type: String },
    timezone: { type: String },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    messagingPreferences: {
      allowDirectMessages: { type: Boolean, default: true },
      blockedCommunities: [{ type: String }],
    },
    paymentSettings: {
      razorpayCustomerId: { type: String },
      razorpayAccountId: { type: String },
      subscriptionId: { type: String },
      subscriptionStatus: {
        type: String,
        enum: ["active", "canceled", "past_due", "unpaid", "trial"],
      },
      subscriptionEndDate: { type: Date },
      enablePayments: { type: Boolean, default: false },
    },
    community: [{ type: Schema.Types.ObjectId, ref: "Community" }],
    followedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    profileImage: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin", "platform_admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("username")) {
    this.slug = slugify(this.username, { lower: true, strict: true });
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    if (!this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  next();
});

userSchema.index(
  { providerId: 1, providerType: 1 },
  { unique: true, sparse: true }
);
export const User = models.User || model<IUser>("User", userSchema);
