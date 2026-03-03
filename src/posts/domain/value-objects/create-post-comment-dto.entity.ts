// * response for db
export type CreatePostCommentDtoEntity = {
  content: string;
  postId: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};
