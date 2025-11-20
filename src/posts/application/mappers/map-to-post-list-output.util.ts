import { WithId } from "mongodb";

import { PostOutput } from "../output/post-type.output";
import { PostsListPaginatedOutput } from "../output/posts-list-type.output";
import { PostDomain } from "../../domain/post.domain";

export function mapToPostListOutput(
  postDb: WithId<PostDomain>[],
  meta: { page: number; pageSize: number; totalCount: number }
): PostsListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: postDb.map(
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
