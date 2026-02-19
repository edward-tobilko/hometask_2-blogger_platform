import mongoose from "mongoose";

import {
  POST_COLLECTION_NAME,
  POST_COMMENTS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "db/collection-names.db";

export type PostCommentsDb = {
  content: string;

  postId: mongoose.Types.ObjectId;

  commentatorInfo: {
    userId: mongoose.Types.ObjectId;
    userLogin: string;
  };

  // createdAt: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    // myStatus: "None";
  };
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

    likesInfo: {
      likesCount: {
        type: Number,
        required: true,
        default: 0,
      },
      dislikesCount: {
        type: Number,
        required: true,
        default: 0,
      },
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
