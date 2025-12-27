import { WithId } from "mongodb";

import { PostOutput } from "../output/post-type.output";
import { PostsListPaginatedOutput } from "../output/posts-list-type.output";
import { PostDB } from "../../../db/types.db";

export function mapToPostListOutput(
  postsDb: WithId<PostDB>[],
  meta: { page: number; pageSize: number; totalCount: number }
): PostsListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,

    items: postsDb.map(
      (post): PostOutput => ({
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString(),
      })
    ),
  };
}
