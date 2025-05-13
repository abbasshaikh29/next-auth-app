import mongoose, { Schema, model, models } from "mongoose";

export interface IPaymentPlan {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval?: "one_time" | "monthly" | "yearly";
  intervalCount?: number;
  trialPeriodDays?: number;
  features?: string[];
  isActive: boolean;
  planType: "platform" | "community";
  communityId?: mongoose.Types.ObjectId; // Only for community plans
  createdBy?: string; // User ID who created the plan
  createdAt: Date;
  updatedAt?: Date;
}

const paymentPlanSchema = new Schema<IPaymentPlan>(
  {
    name: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    interval: { 
      type: String, 
      enum: ["one_time", "monthly", "yearly"],
      default: "monthly"
    },
    intervalCount: { type: Number, default: 1 },
    trialPeriodDays: { type: Number, default: 0 },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    planType: { 
      type: String, 
      required: true, 
      enum: ["platform", "community"] 
    },
    communityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Community" 
    },
    createdBy: { 
      type: String, 
      ref: "User" 
    }
  },
  { timestamps: true }
);

// Create indexes for faster queries
paymentPlanSchema.index({ planType: 1 });
paymentPlanSchema.index({ communityId: 1 });
paymentPlanSchema.index({ isActive: 1 });

export const PaymentPlan = models.PaymentPlan || model<IPaymentPlan>("PaymentPlan", paymentPlanSchema);
