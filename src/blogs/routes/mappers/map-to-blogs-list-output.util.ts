import { WithId } from "mongodb";

import {
  BlogDbDocument,
  BlogListPaginatedOutput,
  BlogViewModel,
} from "../../types/blog.types";

export function mapToBlogsListOutputUtil(
  blogDb: WithId<BlogDbDocument>[],
  meta: { page: number; pageSize: number; totalCount: number }
): BlogListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: blogDb.map(
      (blog): BlogViewModel => ({
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership,
      })
    ),
  };
}
