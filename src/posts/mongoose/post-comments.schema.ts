import mongoose from "mongoose";

import {
  POST_COLLECTION_NAME,
  POST_COMMENTS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "db/collection-names.db";

export type PostCommentsDb = {
  content: string;

  commentatorInfo: {
    userId: mongoose.Types.ObjectId;
    userLogin: string;
  };

  // createdAt: Date;

  postId: mongoose.Types.ObjectId;
};

export type PostCommentsLean = PostCommentsDb & {
  _id: mongoose.Types.ObjectId;
};

export type PostCommentsDocument = mongoose.HydratedDocument<PostCommentsDb>;

const PostCommentsSchema = new mongoose.Schema<PostCommentsDb>(
  {
    content: {
      type: String,
      required: true,
      minLength: [20, "content must be min 20 length symbols"],
      maxLength: [300, "title must not exceed 30 characters"],
    },
    postId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: POST_COLLECTION_NAME,
    },
    commentatorInfo: {
      userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: USERS_COLLECTION_NAME,
      },
      userLogin: { type: String, required: true },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PostCommentsModel = mongoose.model<PostCommentsDb>(
  POST_COMMENTS_COLLECTION_NAME,
  PostCommentsSchema
);
