import { WithId } from "mongodb";

import { PostCommentDomain } from "../../domain/post-comment.domain";
import { PostCommentsListPaginatedOutput } from "../output/post-comments-list-type.output";
import { IPostCommentOutput } from "../output/post-comment.output";

export const mapToPostCommentsListOutput = (
  postCommentsDomain: WithId<PostCommentDomain>[],
  meta: { page: number; pageSize: number; totalCount: number }
): PostCommentsListPaginatedOutput => {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: postCommentsDomain.map(
      (postComment): IPostCommentOutput => ({
        id: postComment._id.toString(),
        content: postComment.content,

        commentatorInfo: {
          userId: postComment.commentatorInfo.userId.toString(),
          userLogin: postComment.commentatorInfo.userLogin,
        },

        createdAt: postComment.createdAt.toISOString(),
      })
    ),
  };
};
