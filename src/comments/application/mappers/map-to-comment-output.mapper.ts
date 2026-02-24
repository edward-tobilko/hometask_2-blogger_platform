import { PostCommentsLean } from "posts/mongoose/post-comments.schema";
import { IPostCommentOutput } from "../../../posts/application/output/post-comment.output";
import { LikeStatus } from "@core/types/like-status.enum";

export const mapToCommentOutput = (
  commentDomain: PostCommentsLean,
  myStatus: LikeStatus
): IPostCommentOutput => {
  return {
    id: commentDomain._id.toString(),
    content: commentDomain.content,

    commentatorInfo: {
      userId: commentDomain.commentatorInfo.userId.toString(),
      userLogin: commentDomain.commentatorInfo.userLogin,
    },

    likesInfo: {
      likesCount: commentDomain.likesInfo.likesCount,
      dislikesCount: commentDomain.likesInfo.dislikesCount,
      myStatus, // динамический статус
    },
    createdAt: commentDomain.createdAt!.toISOString(),
  };
};
