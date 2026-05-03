import { Schema } from 'mongoose';

export const LikesInfoSchema = new Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);
