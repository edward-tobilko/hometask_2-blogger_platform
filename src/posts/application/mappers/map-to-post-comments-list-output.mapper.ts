import { PostCommentsListPaginatedOutput } from "../output/post-comments-list-type.output";
import { IPostCommentOutput } from "../output/post-comment.output";
import { PostCommentsLean } from "posts/infrastructure/schemas/post-comments.schema";
import { LikeStatus } from "@core/types/like-status.enum";
import { CommentLikeLean } from "comments/infrastructure/schemas/comment-likes.schema";

export const mapToPostCommentsListOutput = (
  postCommentsDomain: PostCommentsLean[],
  likes: CommentLikeLean[] | null,
  meta: { page: number; pageSize: number; totalCount: number }
): PostCommentsListPaginatedOutput => {
  // * Создаем map для быстрого доступа
  const userLikes = new Map<string, LikeStatus>();

  (likes ?? []).forEach((like) => {
    userLikes.set(like.commentId.toString(), like.status);
  });

  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: postCommentsDomain.map((postComment): IPostCommentOutput => {
      const myStatus =
        userLikes.get(postComment._id.toString()) ?? LikeStatus.None;

      return {
        id: postComment._id.toString(),
        content: postComment.content,

        commentatorInfo: {
          userId: postComment.commentatorInfo.userId.toString(),
          userLogin: postComment.commentatorInfo.userLogin,
        },

        likesInfo: {
          likesCount: postComment.likesInfo.likesCount,
          dislikesCount: postComment.likesInfo.dislikesCount,
          myStatus,
        },

        createdAt: postComment.createdAt!.toISOString(),
      };
    }),
  };
};
