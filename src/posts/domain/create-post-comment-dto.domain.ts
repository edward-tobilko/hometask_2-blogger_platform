import { ObjectId } from "mongodb";

// * response for db
export type CreatePostCommentDtoDomain = {
  content: string;
  postId: ObjectId | string;

  commentatorInfo: {
    userId: ObjectId;
    userLogin: string;
  };
};
