export interface IPostCommentOutput {
  id: string;
  content: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: string;
}
