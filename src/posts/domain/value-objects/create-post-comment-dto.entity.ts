// * response for db
export type CreatePostCommentDtoEntity = {
  content: string;
  postId: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
};
