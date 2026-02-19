import { PostCommentsLean } from "posts/mongoose/post-comments.schema";
import { IPostCommentOutput } from "../../../posts/application/output/post-comment.output";

export const mapToCommentOutput = (
  commentDomain: PostCommentsLean
): IPostCommentOutput => {
  return {
    id: commentDomain._id.toString(),
    content: commentDomain.content,

    commentatorInfo: {
      userId: commentDomain.commentatorInfo.userId.toString(),
      userLogin: commentDomain.commentatorInfo.userLogin,
    },
    // createdAt: commentDomain.createdAt.toISOString(),
  };
};
