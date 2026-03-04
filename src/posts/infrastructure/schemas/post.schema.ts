import mongoose from "mongoose";

import {
  BLOG_COLLECTION_NAME,
  POST_COLLECTION_NAME,
} from "db/collection-names.db";

export type PostDb = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: mongoose.Types.ObjectId;

  blogName: string;
  createdAt: Date;

  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;

    newestLikes: Array<{
      addedAt: Date;
      userId: string;
      login: string;
    }>;
  };
};

export type PostLean = PostDb & { _id: mongoose.Types.ObjectId };
export type PostDocument = mongoose.HydratedDocument<PostDb>;

const NewestLikeSchema = new mongoose.Schema(
  {
    addedAt: { type: Date, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true },
  },
  { _id: false }
);

const ExtendedLikesInfoSchema = new mongoose.Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
    newestLikes: { type: [NewestLikeSchema], required: true, default: [] },
  },
  { _id: false }
);

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
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: BLOG_COLLECTION_NAME,
    },
    blogName: {
      type: String,
      required: true,
      maxLength: [100, "content must not exceed 100 characters"],
    },
    createdAt: { type: Date, required: true },

    extendedLikesInfo: {
      type: ExtendedLikesInfoSchema,
      required: true,
      default: () => ({ likesCount: 0, dislikesCount: 0, newestLikes: [] }),
    },
  },
  {
    timestamps: false, // createdAt создаем сами
    versionKey: false,
  }
);

export const PostModel = mongoose.model<PostDb>(
  "Post",
  PostSchema,
  POST_COLLECTION_NAME
);
