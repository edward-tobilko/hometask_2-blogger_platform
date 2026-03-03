import mongoose from "mongoose";

// * response for db
export type CreatePostCommentDtoEntity = {
  content: string;
  postId: mongoose.Types.ObjectId;

  commentatorInfo: {
    userId: mongoose.Types.ObjectId;
    userLogin: string;
  };

  createdAt?: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};
