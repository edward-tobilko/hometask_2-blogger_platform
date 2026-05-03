import { Schema } from 'mongoose';

import { NewestLikeSchema } from './newest-like.schema';

export const ExtendedLikesInfoSchema = new Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
    newestLikes: { type: [NewestLikeSchema], required: true, default: [] },
  },
  { _id: false },
);
