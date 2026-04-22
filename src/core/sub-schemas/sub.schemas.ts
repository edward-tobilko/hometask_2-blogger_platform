import { Schema } from 'mongoose';

// * Sub document schemas
export const NewestLikeSchema = new Schema(
  {
    addedAt: { type: Date, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true },
  },
  { _id: false },
);

export const ExtendedLikesInfo = new Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
    newestLikes: { type: [NewestLikeSchema], required: true, default: [] },
  },
  { _id: false },
);

export const LikesInfoSchema = new Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

export const CommentatorInfo = new Schema(
  {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  { _id: false },
);
