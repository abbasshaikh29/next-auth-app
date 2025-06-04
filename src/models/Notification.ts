import mongoose, { Schema, model, models } from "mongoose";

export interface INotification {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // User receiving the notification
  type: string; // Type of notification (e.g., "post", "admin-post", "mention")
  title: string; // Title of the notification
  content: string; // Content of the notification
  sourceId: mongoose.Types.ObjectId; // ID of the related item (post, comment, etc.)
  sourceType: string; // Type of the source (post, comment, etc.)
  communityId: mongoose.Types.ObjectId; // Community where the notification originated
  read: boolean; // Whether the notification has been read
  createdAt: Date; // When the notification was created
  createdBy: mongoose.Types.ObjectId; // User who triggered the notification
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["post", "admin-post", "mention", "comment", "like", "join-request", "follow"],
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sourceType: {
      type: String,
      required: true,
      enum: ["post", "comment", "community", "user"],
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ communityId: 1 });

export const Notification =
  models.Notification || model<INotification>("Notification", notificationSchema);
