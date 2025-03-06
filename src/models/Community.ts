import mongoose, { Schema, model, models } from "mongoose";

import slugify from "slugify"; // Install slugify: npm install slugify

export interface ICommunity {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, unique: true, sparse: true }, // Add sparse: true
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

communitySchema.pre("save", async function (next) {
  if (this.isModified("username")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Community =
  models.Community || model<ICommunity>("Community", communitySchema);
