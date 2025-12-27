import { PostCommentDB } from "../../../db/types.db";
import { IPostCommentOutput } from "../../../posts/application/output/post-comment.output";

export const mapToCommentOutput = (
  commentDomain: PostCommentDB
): IPostCommentOutput => {
  return {
    id: commentDomain._id!.toString(),
    content: commentDomain.content,
    commentatorInfo: {
      userId: commentDomain.commentatorInfo.userId.toString(),
      userLogin: commentDomain.commentatorInfo.userLogin,
    },
    createdAt: commentDomain.createdAt.toISOString(),
  };
};
