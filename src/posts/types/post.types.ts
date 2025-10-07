import { ObjectId } from "mongodb";

// * view model
export type PostView = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

// * database model
export type PostDb = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: ObjectId;
  blogName: string;
  createdAt: Date;
};

// * dto model
export type PostInputDto = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
