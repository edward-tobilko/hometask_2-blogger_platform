import { model, Schema } from "mongoose";

export type CustomRateLimitDb = {
  ip: string;
  url: string;
  date: Date;
};

const CustomRateLimitSchema = new Schema<CustomRateLimitDb>(
  {
    ip: {
      type: String,
      required: true,
    },
    url: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false }
);

// * TTL index - автоматическое удаление через 60сек.
CustomRateLimitSchema.index({ date: 1 }, { expireAfterSeconds: 60 });

CustomRateLimitSchema.index({ ip: 1, url: 1, date: 1 }); // ip + url + date

export const CustomRateLimitModel = model<CustomRateLimitDb>(
  "CustomRateLimit",
  CustomRateLimitSchema
);
