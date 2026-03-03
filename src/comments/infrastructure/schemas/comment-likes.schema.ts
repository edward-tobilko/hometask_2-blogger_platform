import mongoose from "mongoose";

import { LikeStatus } from "@core/types/like-status.enum";
import {
  COMMENT_LIKE_STATUS_COLLECTION_NAME,
  POST_COMMENTS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "db/collection-names.db";

type CommentLikeDb = {
  commentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: LikeStatus;
};

export type CommentLikeDocument = mongoose.HydratedDocument<CommentLikeDb>;

export type CommentLikeLean = CommentLikeDb & {
  _id: mongoose.Types.ObjectId;
};

const CommentLikeSchema = new mongoose.Schema<CommentLikeDb>(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: POST_COMMENTS_COLLECTION_NAME,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: USERS_COLLECTION_NAME,
    },

    status: {
      type: mongoose.Schema.Types.String,
      required: true,
      enum: Object.values(LikeStatus),
      default: LikeStatus.None,
    },
  },

  { timestamps: true, versionKey: false }
);

// * Один пользователь может поставить только один like / dislike на комментарий
CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const CommentLikeModel = mongoose.model<CommentLikeDb>(
  "CommentLike",
  CommentLikeSchema,
  COMMENT_LIKE_STATUS_COLLECTION_NAME
);
