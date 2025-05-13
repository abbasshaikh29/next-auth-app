import mongoose from "mongoose";

export interface IPost {
  _id: string;
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  authorName: string;
  isPinned?: boolean; // Whether the post is pinned by admin
}

const postSchema = new mongoose.Schema<IPost>({
  title: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
});

// Check if the model already exists
export const Post =
  mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
