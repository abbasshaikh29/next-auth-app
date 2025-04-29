import mongoose, { Schema, model, models } from "mongoose";

export interface IUserProgress {
  _id?: mongoose.Types.ObjectId;
  userId: string; // User ID
  courseId: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[]; // Array of Lesson IDs
  lastAccessedLesson?: mongoose.Types.ObjectId; // Reference to Lesson
  lastAccessedAt?: Date;
  progress: number; // Percentage (0-100)
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: { 
      type: String, 
      ref: "User", 
      required: true 
    },
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    completedLessons: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Lesson" 
    }],
    lastAccessedLesson: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Lesson" 
    },
    lastAccessedAt: { type: Date },
    progress: { type: Number, default: 0 }, // 0-100
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Create a compound index for userId and courseId to ensure uniqueness
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserProgress = models.UserProgress || model<IUserProgress>("UserProgress", userProgressSchema);
