import mongoose, { Schema, model, models } from "mongoose";

export interface ICourse {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  communityId: mongoose.Types.ObjectId;
  createdBy: string; // User ID
  thumbnail?: string; // S3 image URL
  isPublished: boolean;
  isPublic: boolean; // Whether visible to non-members
  createdAt: Date;
  updatedAt?: Date;
  enrolledUsers: string[]; // Array of User IDs
  tags?: string[];
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String },
    communityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Community", 
      required: true 
    },
    createdBy: { 
      type: String, 
      ref: "User", 
      required: true 
    },
    thumbnail: { type: String },
    isPublished: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    enrolledUsers: [{ type: String, ref: "User" }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Create indexes for faster queries
courseSchema.index({ communityId: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ tags: 1 });

export const Course = models.Course || model<ICourse>("Course", courseSchema);
