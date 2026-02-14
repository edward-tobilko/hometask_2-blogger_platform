import mongoose from "mongoose";

export type PostDb = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: mongoose.Types.ObjectId;
  blogName: string;
};

export type PostLean = PostDb & { _id: mongoose.Types.ObjectId };
export type PostDocument = mongoose.HydratedDocument<PostDb>;

const PostSchema = new mongoose.Schema<PostDb>(
  {
    title: {
      type: String,
      required: true,
      maxLength: [30, "title must not exceed 30 characters"],
    },
    shortDescription: {
      type: String,
      required: true,
      maxLength: [100, "shortDescription must not exceed 100 characters"],
    },
    content: {
      type: String,
      required: true,
      maxLength: [1000, "content must not exceed 1000 characters"],
    },
    blogId: { type: mongoose.Types.ObjectId, required: true, ref: "blog" },
    blogName: {
      type: String,
      required: true,
      maxLength: [100, "content must not exceed 100 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PostModel = mongoose.model<PostDb>("post", PostSchema);
