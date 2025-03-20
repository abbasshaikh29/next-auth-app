import mongoose, { Schema, model, models } from "mongoose";

export interface IImage {
  _id?: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  transformation?: {
    height: number;
    width: number;
  };
}

const imageSchema = new Schema<IImage>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    transformation: {
      height: { type: Number },
      width: { type: Number },
    },
  },
  { timestamps: true }
);

const Image = models?.Image || model<IImage>("Image", imageSchema);

export default Image;
