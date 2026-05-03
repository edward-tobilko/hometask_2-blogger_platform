import { Schema } from 'mongoose';

export const NewestLikeSchema = new Schema(
  {
    addedAt: { type: Date, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true },
  },
  { _id: false },
);
