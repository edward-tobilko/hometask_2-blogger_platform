import { ObjectId } from "mongodb";

// * response for db
export type CreatePostCommentDtoDomain = {
  content: string;

  commentatorInfo: {
    userId: ObjectId;
    userLogin: string;
  };
};
