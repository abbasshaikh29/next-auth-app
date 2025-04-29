import mongoose, { Schema, model, models } from "mongoose";

export interface IModule {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  courseId: mongoose.Types.ObjectId;
  order: number; // For sorting
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
  releaseDate?: Date; // For content dripping
}

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true },
    description: { type: String },
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    releaseDate: { type: Date },
  },
  { timestamps: true }
);

// Create indexes for faster queries
moduleSchema.index({ courseId: 1, order: 1 });
moduleSchema.index({ isPublished: 1 });

export const Module = models.Module || model<IModule>("Module", moduleSchema);
