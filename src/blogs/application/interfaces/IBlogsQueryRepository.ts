import { LikeStatus } from "@core/types/like-status.enum";
import { BlogListPaginatedOutput } from "blogs/application/output/blog-list-paginated-type.output";
import { BlogOutput } from "blogs/application/output/blog-type.output";
import { GetBlogsListQueryHandler } from "blogs/application/query-handlers/get-blogs-list-type.query-handler";
import { GetPostsListQueryHandler } from "posts/application/query-handlers/get-posts-list.query-handler";
import { PostEntity } from "posts/domain/entities/post.entity";

export interface IBlogsQueryRepository {
  findAllBlogs(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput>;

  findBlogById(blogId: string): Promise<BlogOutput | null>;

  findAllPostsForBlog(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string
  ): Promise<{
    postsEntity: PostEntity[];
    userLikes: Map<string, LikeStatus>;
    totalCount: number;
  }>;
}
