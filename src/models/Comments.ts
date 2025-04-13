import mongoose from "mongoose";

export interface IComment {
  _id: string;
  text: string;
  author: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  authorName: string;
}

const commentSchema = new mongoose.Schema<IComment>({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  authorName: { type: String, required: true },
});

export const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
