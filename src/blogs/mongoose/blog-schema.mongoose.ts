import { BLOG_COLLECTION_NAME } from "db/collection-names.db";
import mongoose from "mongoose";

export type BlogDb = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type BlogLean = BlogDb & { _id: mongoose.Types.ObjectId };
export type BlogDocument = mongoose.HydratedDocument<BlogDb>;

const BlogSchema = new mongoose.Schema<BlogDb>(
  {
    name: {
      type: String,
      required: true,
      maxLength: [15, "Name must not exceed 15 characters"],
    },
    description: {
      type: String,
      required: true,
      maxLength: [500, "Name must not exceed 500 characters"],
    },
    websiteUrl: {
      type: String,
      required: true,
      maxLength: [100, "Name must not exceed 100 characters"],
      match: [/^https:\/\/.+/i, "Website URL must be a valid https URL"],
    },
    isMembership: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const BlogModel = mongoose.model<BlogDb>(
  BLOG_COLLECTION_NAME,
  BlogSchema
);
