import { BlogQueryRepository } from "../repositories/blog-query.repository";
import { BlogListPaginatedOutput } from "./output/blog-list-paginated-type.output";
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
}

export const blogsQueryService = new BlogQueryService();
