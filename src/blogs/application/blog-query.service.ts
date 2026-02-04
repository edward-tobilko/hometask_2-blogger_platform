import { inject, injectable } from "inversify";

import { PostsListPaginatedOutput } from "../../posts/application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "../../posts/application/query-handlers/get-posts-list.query-handler";
import { BlogListPaginatedOutput } from "./output/blog-list-paginated-type.output";
import { BlogOutput } from "./output/blog-type.output";
import { GetBlogsListQueryHandler } from "./query-handlers/get-blogs-list-type.query-handler";
import { IBlogsQueryService } from "blogs/interfaces/IBlogsQueryService";
import { Types } from "@core/di/types";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";

@injectable()
export class BlogsQueryService implements IBlogsQueryService {
  constructor(
    @inject(Types.IBlogsQueryRepository)
    private blogsQueryRepository: IBlogsQueryRepository
  ) {}

  async getBlogsList(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput> {
    return await this.blogsQueryRepository.findAllBlogs(queryParam);
  }

  async getBlogById(blogId: string): Promise<BlogOutput> {
    return await this.blogsQueryRepository.findBlogById(blogId);
  }

  async getPostsListByBlog(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    return await this.blogsQueryRepository.findAllPostsForBlog(queryParam);
  }
}
