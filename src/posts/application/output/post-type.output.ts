import { LikeStatus } from "@core/types/like-status.enum";

// * Output model
export type PostOutput = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;

  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;

    newestLikes: Array<{
      addedAt: string;
      userId: string;
      login: string;
    }>;
  };
};
