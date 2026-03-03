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

  createdAt?: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
};

export type PostCommentsLean = PostCommentsDb & {
  _id: mongoose.Types.ObjectId;
};

export type PostCommentsDocument = mongoose.HydratedDocument<PostCommentsDb>;

const LikesInfoSchema = new mongoose.Schema(
  {
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
  { _id: false } // что бы не создавало id для вложенного объекта likesInfo в mongo
);

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
      type: LikesInfoSchema,
      required: true,

      default: () => ({ likesCount: 0, dislikesCount: 0 }), // * что бы не прокидывать likesInfo при создании post comments (автоматически появиться).
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

export const PostCommentsModel = mongoose.model<PostCommentsDb>(
  "PostComments",
  PostCommentsSchema,
  POST_COMMENTS_COLLECTION_NAME
);
