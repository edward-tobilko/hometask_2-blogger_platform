import { BlogListPaginatedOutput } from "blogs/application/output/blog-list-paginated-type.output";
import { BlogOutput } from "blogs/application/output/blog-type.output";
import { GetBlogsListQueryHandler } from "blogs/application/query-handlers/get-blogs-list-type.query-handler";
import { PostsListPaginatedOutput } from "posts/application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "posts/application/query-handlers/get-posts-list.query-handler";

export interface IBlogsQueryRepository {
  findAllBlogs(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput>;

  findBlogById(blogId: string): Promise<BlogOutput | null>;

  findAllPostsForBlog(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput>;
}
