import mongoose, { Schema, model, models } from "mongoose";

export interface IEvent {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  communityId: mongoose.Types.ObjectId;
  createdBy: string; // User ID of the creator (admin or sub-admin)
  createdAt: Date;
  updatedAt?: Date;
  color?: string; // For event categorization/display
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  location: { type: String },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  color: { type: String, default: "#3788d8" }, // Default blue color
});

// Create indexes for faster queries
eventSchema.index({ communityId: 1 });
eventSchema.index({ start: 1, end: 1 });

export const Event = models.Event || model<IEvent>("Event", eventSchema);
