import mongoose from "mongoose";

import {
  POST_COLLECTION_NAME,
  POST_LIKE_STATUS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "./../../../db/collection-names.db";
import { LikeStatus } from "@core/types/like-status.enum";

type PostLikeDb = {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  likeStatus: LikeStatus;
  login: string;

  addedAt: Date; // когда поставили Like (для newestLikes)
};

export type PostLikeLean = PostLikeDb & {
  _id: mongoose.Types.ObjectId;
};
export type PostLikeDocument = mongoose.HydratedDocument<PostLikeDb>;

const PostLikeSchema = new mongoose.Schema<PostLikeDb>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: POST_COLLECTION_NAME,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: USERS_COLLECTION_NAME,
    },
    likeStatus: {
      type: String,
      required: true,
      enum: Object.values(LikeStatus),
      default: LikeStatus.None,
    },
    login: { type: String, required: true },
    addedAt: { type: Date, required: true, default: () => new Date() },
    //   updatedAt: { type: Date, required: true },
  },
  { timestamps: false, versionKey: false }
);

// * Один пользователь может поставить только один like / dislike на пост
PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const PostLikeModel = mongoose.model(
  "PostLike",
  PostLikeSchema,
  POST_LIKE_STATUS_COLLECTION_NAME
);
