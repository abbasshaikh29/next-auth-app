import mongoose, { Schema, model, models } from "mongoose";
import slugify from "slugify"; // Install slugify: npm install slugify

export interface CommunityMediaItem {
  url: string;
  type: "image" | "video";
  title?: string;
  createdAt: Date;
}

export interface ICommunity {
  _id?: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  bannerImageurl?: string;
  iconImageUrl?: string; // Added icon image URL field
  aboutMedia?: CommunityMediaItem[]; // Media items for the about page
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
  paymentEnabled?: boolean; // Whether the community accepts payments
  paymentPlans?: mongoose.Types.ObjectId[]; // Array of payment plan IDs
  subscriptionRequired?: boolean; // Whether subscription is required to join
  isPrivate?: boolean; // Whether the community is private or public
  price?: number; // Price for joining the community
  currency?: string; // Currency for the price (USD, INR, etc.)
  pricingType?: "monthly" | "yearly" | "one_time"; // Type of pricing (monthly, yearly, or one-time)
  
  // New fields for payment and subscription
  paymentStatus?: "unpaid" | "trial" | "paid" | "expired"; // Status of payment
  paymentDate?: Date; // Date when payment was made
  transactionId?: string; // ID of the payment transaction
  paymentId?: string; // ID of the payment
  freeTrialActivated?: boolean; // Whether free trial is activated
  freeTrialStartDate?: Date; // Start date of free trial
  freeTrialEndDate?: Date; // End date of free trial
  subscriptionEndDate?: Date; // End date of subscription
  
  // Admin-specific trial information
  adminTrialInfo?: {
    activated: boolean;
    startDate?: Date;
    endDate?: Date;
  };
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, unique: true, sparse: true }, // Add sparse: true
  createdBy: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  bannerImageurl: { type: String },
  iconImageUrl: { type: String }, // Added icon image URL field
  aboutMedia: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
      title: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
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
  paymentEnabled: { type: Boolean, default: false },
  paymentPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "PaymentPlan" }],
  subscriptionRequired: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: true }, // Default to private
  price: { type: Number, default: 0 }, // Default price is 0 (free)
  currency: { type: String, default: "USD" }, // Default currency is USD
  pricingType: {
    type: String,
    enum: ["monthly", "yearly", "one_time"],
    default: "one_time",
  }, // Default to one-time payment
  
  // New fields for payment and subscription
  paymentStatus: { 
    type: String, 
    enum: ["unpaid", "trial", "paid", "expired"], 
    default: "unpaid" 
  },
  paymentDate: { type: Date },
  transactionId: { type: String },
  paymentId: { type: String },
  freeTrialActivated: { type: Boolean, default: false },
  freeTrialStartDate: { type: Date },
  freeTrialEndDate: { type: Date },
  subscriptionEndDate: { type: Date },
  
  // Admin-specific trial information
  adminTrialInfo: {
    activated: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date }
  }
});

// Function to generate a slug from a name
function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

// Pre-save hook to automatically generate slug for new documents
communitySchema.pre("save", async function (next) {
  // For new documents or when name is modified, generate a slug
  if (this.isNew || this.isModified("name")) {
    const oldSlug = this.slug;
    this.slug = generateSlug(this.name);
  }

  next();
});

// Export the generateSlug function to use it elsewhere
export { generateSlug };

export const Community =
  models.Community || model<ICommunity>("Community", communitySchema);
