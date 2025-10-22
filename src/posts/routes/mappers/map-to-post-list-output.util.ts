import { WithId } from "mongodb";

import {
  PostDbDocument,
  PostForBlogListPaginatedOutput,
  PostViewModel,
} from "../../types/post.types";

export function mapToPostListOutputUtil(
  postDb: WithId<PostDbDocument>[],
  meta: { page: number; pageSize: number; totalCount: number }
): PostForBlogListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: postDb.map(
      (post): PostViewModel => ({
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
