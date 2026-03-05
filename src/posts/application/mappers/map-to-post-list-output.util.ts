import { PostLikeLean } from "posts/infrastructure/schemas/post-like.schema";
import { PostOutput } from "../output/post-type.output";
import { PostsListPaginatedOutput } from "../output/posts-list-type.output";
import { PostLean } from "posts/infrastructure/schemas/post.schema";
import { LikeStatus } from "@core/types/like-status.enum";

export function mapToPostListOutput(
  postsDb: PostLean[],
  likes: PostLikeLean[] | null,
  meta: { page: number; pageSize: number; totalCount: number }
): PostsListPaginatedOutput {
  // * Создаем map для быстрого доступа
  const userLikes = new Map<string, LikeStatus>();

  (likes ?? []).forEach((like) => {
    userLikes.set(like.postId.toString(), like.likeStatus);
  });

  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: postsDb.map((post): PostOutput => {
      const myStatus = userLikes.get(post._id.toString()) ?? LikeStatus.None;

      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString(),

        extendedLikesInfo: {
          likesCount: post.extendedLikesInfo.likesCount,
          dislikesCount: post.extendedLikesInfo.dislikesCount,
          myStatus,

          newestLikes: post.extendedLikesInfo.newestLikes.map((newestLike) => ({
            addedAt: newestLike.addedAt.toISOString(),
            userId: newestLike.userId.toString(),
            login: newestLike.login,
          })),
        },
      };
    }),
  };
}
