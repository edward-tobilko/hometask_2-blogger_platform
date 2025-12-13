import { PostsListPaginatedOutput } from "../../posts/application/output/posts-list-type.output";
import { GetPostsListQueryHandler } from "../../posts/application/query-handlers/get-posts-list.query-handler";
import { BlogQueryRepository } from "../repositories/blog-query.repository";
import { BlogListPaginatedOutput } from "./output/blog-list-paginated-type.output";
import { BlogOutput } from "./output/blog-type.output";
import { GetBlogsListQueryHandler } from "./query-handlers/get-blogs-list-type.query-handler";

class BlogQueryService {
  private blogQueryRepository: BlogQueryRepository;

  constructor() {
    this.blogQueryRepository = new BlogQueryRepository();
  }

  async getBlogsList(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput> {
    return await this.blogQueryRepository.findAllBlogsQueryRepo(queryParam);
  }

  async getBlogById(blogId: string): Promise<BlogOutput> {
    return await this.blogQueryRepository.findBlogByIdQueryRepo(blogId);
  }

  async getPostsListByBlog(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    return await this.blogQueryRepository.findAllPostsForBlogQueryRepo(
      queryParam
    );
  }
}

export const blogsQueryService = new BlogQueryService();
