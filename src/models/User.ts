import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  slug?: string;
  createdAt: Date;
  firstName?: string;
  lastName?: string;
  timezone?: string;
  notificationSettings?: NotificationSettings;
  community: mongoose.Types.ObjectId[];
  followedBy: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    community: [{ type: Schema.Types.ObjectId, ref: "Community" }],
    followedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
  if (this.isModified("password")) {
    console.log("Password modified - current value:", this.password);
    if (!this.password.startsWith("$2b$")) {
      console.log("Hashing raw password");
      this.password = await bcrypt.hash(this.password, 10);
    } else {
      console.log("Password already hashed - skipping rehash");
    }
  }
  next();
});

export const User = models.User || model<IUser>("User", userSchema);
