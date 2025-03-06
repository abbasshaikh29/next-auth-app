import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify"; // Install slugify: npm install slugify

export interface IUser {
  username: string;
  email: string;
  password: string;
  slug?: string; // Make
  createdAt: Date;

  community: mongoose.Types.ObjectId[];
  followedBy: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    slug: { type: String, unique: true, sparse: true }, // Add sparse: true
    createdAt: { type: Date, default: Date.now },

    community: [{ type: Schema.Types.ObjectId, ref: "Community" }],
    followedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true, //
  }
);

// Generate slug before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("username")) {
    this.slug = slugify(this.username, { lower: true, strict: true });
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = models.User || model<IUser>("User", userSchema);
