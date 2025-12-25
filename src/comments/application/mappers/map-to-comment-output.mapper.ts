import { IPostCommentOutput } from "../../../posts/application/output/post-comment.output";
import { PostCommentDomain } from "../../../posts/domain/post-comment.domain";

export const mapToCommentOutput = (
  commentDomain: PostCommentDomain
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
