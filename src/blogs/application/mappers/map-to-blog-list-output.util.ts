import { WithId } from "mongodb";

import { BlogListPaginatedOutput } from "../output/blog-list-paginated-type.output";
import { BlogOutput } from "../output/blog-type.output";
import { BlogDB } from "../../../db/types.db";

export function mapToBlogListOutput(
  blogDb: WithId<BlogDB>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number }
): BlogListPaginatedOutput {
  return {
    pagesCount: Math.ceil(meta.totalCount / +meta.pageSize),
    page: +meta.pageNumber,
    pageSize: +meta.pageSize,
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
