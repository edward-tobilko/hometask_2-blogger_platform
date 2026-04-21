import { Schema } from 'mongoose';

// * Subdocument schemas
export const NewestLikeSchema = new Schema(
  {
    addedAt: { type: Date, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true },
  },
  { _id: false },
);

export const LikesInfoSchema = new Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
    newestLikes: { type: [NewestLikeSchema], required: true, default: [] },
  },
  { _id: false },
);
