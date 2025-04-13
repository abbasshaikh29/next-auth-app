import mongoose, { Schema, model, models } from "mongoose";
import slugify from "slugify"; // Install slugify: npm install slugify

export interface ICommunity {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  bannerImageurl?: string;
  createdBy: string;
  createdAt: Date;
  admin: string; // User ID of the admin
  members: string[]; // Array of user IDs who are members
  subAdmins?: string[];
  joinRequests: {
    userId: string;
    status: "pending" | "approved" | "rejected";
    answers: string[];
    createdAt: Date;
  }[];
  adminQuestions: string[]; // Array of questions set by admin
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, unique: true, sparse: true }, // Add sparse: true
  createdBy: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  bannerImageurl: { type: String },
  admin: { type: String, ref: "User", required: true },
  members: [{ type: String, ref: "User" }],
  subAdmins: [{ type: String }],
  joinRequests: [
    {
      userId: { type: String, ref: "User", required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      answers: [{ type: String }],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  adminQuestions: [{ type: String }],
});

communitySchema.pre("save", async function (next) {
  // Generate slug if name is present and slug is not already set
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Community =
  models.Community || model<ICommunity>("Community", communitySchema);
