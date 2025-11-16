import { WithId } from "mongodb";

import { BlogDomain } from "../../domain/blog.domain";
import { BlogListPaginatedOutput } from "../output/blog-list-paginated-type.output";
import { BlogOutput } from "../output/blog-type.output";

export function mapToBlogListOutput(
  blogDb: WithId<BlogDomain>[],
  meta: { page: number; pageSize: number; totalCount: number }
): BlogListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.page,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: blogDb.map(
      (blog): BlogOutput => ({
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
