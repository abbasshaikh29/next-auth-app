import mongoose, { Schema, model, models } from "mongoose";

export interface Attachment {
  name: string;
  url: string;
  type: string; // file type: pdf, doc, etc.
  size?: number; // file size in bytes
}

export interface ILesson {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  moduleId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  order: number; // For sorting
  content?: string; // Rich text content
  videoUrl?: string; // S3 or external video URL
  attachments?: Attachment[];
  isPublished: boolean;
  duration?: number; // Estimated minutes
  createdAt: Date;
  updatedAt?: Date;
  releaseDate?: Date; // For content dripping
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    description: { type: String },
    moduleId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Module", 
      required: true 
    },
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    order: { type: Number, default: 0 },
    content: { type: String },
    videoUrl: { type: String },
    attachments: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number }
    }],
    isPublished: { type: Boolean, default: false },
    duration: { type: Number }, // in minutes
    releaseDate: { type: Date },
  },
  { timestamps: true }
);

// Create indexes for faster queries
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ isPublished: 1 });

export const Lesson = models.Lesson || model<ILesson>("Lesson", lessonSchema);
