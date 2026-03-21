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

  createdAt: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
};

export type PostCommentsDocument = mongoose.HydratedDocument<PostCommentsDb>; // smart document with different methods, middlewares, getters / setters
export type PostCommentsModelType = mongoose.Model<PostCommentsDb>;
export type PostCommentsLean = PostCommentsDb & {
  _id: mongoose.Types.ObjectId;
}; // for just reading

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

const PostCommentsSchema = new mongoose.Schema<
  PostCommentsDb,
  PostCommentsModelType
>(
  {
    content: {
      type: String,
      required: true,
      minLength: [20, "Content must be min 20 length symbols"],
      maxLength: [300, "Content must not exceed 300 characters"],
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

    createdAt: { type: Date, required: true },

    likesInfo: {
      type: LikesInfoSchema,
      required: true,

      default: () => ({ likesCount: 0, dislikesCount: 0 }), // * что бы не прокидывать likesInfo при создании post comments (автоматически появиться в репо).
    },
  },

  {
    timestamps: false,
    versionKey: false,
  }
);

export const PostCommentsModel = mongoose.model<
  PostCommentsDb,
  PostCommentsModelType
>("PostComments", PostCommentsSchema, POST_COMMENTS_COLLECTION_NAME);
