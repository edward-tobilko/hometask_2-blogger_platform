import { PostsListPaginatedOutput } from "../../posts/application/output/posts-list-type.output";
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
    queryDto: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput> {
    return await this.blogQueryRepository.findAllBlogsQueryRepo(queryDto);
  }

  async getBlogById(blogId: string): Promise<BlogOutput> {
    return await this.blogQueryRepository.findBlogByIdQueryRepo(blogId);
  }

  async getPostsListByBlog(
    queryDto: GetBlogsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    return await this.blogQueryRepository.findAllPostsForBlogQueryRepo(
      queryDto
    );
  }
}

export const blogsQueryService = new BlogQueryService();
