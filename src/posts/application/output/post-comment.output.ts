import { LikeStatus } from "@core/types/like-status.enum";

export interface IPostCommentOutput {
  id: string;
  content: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  createdAt: string;
}
