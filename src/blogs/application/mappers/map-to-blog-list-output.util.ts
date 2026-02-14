import { BlogLean } from "blogs/mongoose/blog-schema.mongoose";
import { BlogListPaginatedOutput } from "../output/blog-list-paginated-type.output";
import { BlogOutput } from "../output/blog-type.output";

export function mapToBlogListOutput(
  blogDb: BlogLean[],
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
