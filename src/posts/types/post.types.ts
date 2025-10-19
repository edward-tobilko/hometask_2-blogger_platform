import { ObjectId } from "mongodb";

// * View model
export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

// * DataBase model
export type PostDbDocument = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
};

// * Dto model
export type PostInputDtoModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
