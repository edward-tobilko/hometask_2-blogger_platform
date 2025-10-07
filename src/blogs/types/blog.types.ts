import { ObjectId } from "mongodb";

type BlogView = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

type BlogDb = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

type BlogInputDto = {
  name: string;
  description: string;
  websiteUrl: string;
};

export { BlogView, BlogInputDto, BlogDb };
