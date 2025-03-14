import mongoose, { Schema, model, models } from "mongoose";
import slugify from "slugify"; // Install slugify: npm install slugify

export interface ICommunity {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  bannerImage?: string;
  createdBy: string;
  createdAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, unique: true, sparse: true }, // Add sparse: true
  createdBy: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  bannerImage: { type: String },
});

communitySchema.pre("save", async function (next) {
  console.log("Pre-save hook triggered");
  console.log("Name:", this.name);
  console.log("Current slug:", this.slug);

  // Generate slug if name is present and slug is not already set
  if (this.name && !this.slug) {
    console.log("Generating slug from name:", this.name);
    this.slug = slugify(this.name, { lower: true, strict: true });
    console.log("Generated slug:", this.slug);
  }
  next();
});

export const Community =
  models.Community || model<ICommunity>("Community", communitySchema);
