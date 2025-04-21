import mongoose, { Schema, model, models } from "mongoose";
import slugify from "slugify"; // Install slugify: npm install slugify

export interface ICommunity {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  bannerImageurl?: string;
  iconImageUrl?: string; // Added icon image URL field
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
  iconImageUrl: { type: String }, // Added icon image URL field
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

// Function to generate a slug from a name
function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

// Pre-save hook to automatically generate slug for new documents
communitySchema.pre("save", async function (next) {
  console.log("Pre-save hook triggered");
  console.log("Document is new:", this.isNew);
  console.log("Document name:", this.name);
  console.log("Document slug:", this.slug);
  console.log("Is name modified:", this.isModified("name"));

  // For new documents or when name is modified, generate a slug
  if (this.isNew || this.isModified("name")) {
    const oldSlug = this.slug;
    this.slug = generateSlug(this.name);
    console.log("Slug updated from", oldSlug, "to", this.slug);
  }

  next();
});

// Export the generateSlug function to use it elsewhere
export { generateSlug };

export const Community =
  models.Community || model<ICommunity>("Community", communitySchema);
