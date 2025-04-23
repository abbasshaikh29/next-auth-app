import mongoose, { Schema, model, models } from "mongoose";

export interface IConversation {
  _id?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCounts: {
    userId: mongoose.Types.ObjectId;
    count: number;
  }[];
  updatedAt: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageTime: {
      type: Date,
    },
    unreadCounts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation =
  models.Conversation ||
  model<IConversation>("Conversation", conversationSchema);
