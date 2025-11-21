import { PostQueryRepository } from "../repositories/post-query.repository";
import { PostOutput } from "./output/post-type.output";
import { PostsListPaginatedOutput } from "./output/posts-list-type.output";
import { GetPostsListQueryHandler } from "./query-handlers/get-posts-list.query-handler";

class PostQueryService {
  private postsQueryRepository: PostQueryRepository;

  constructor() {
    this.postsQueryRepository = new PostQueryRepository();
  }

  async getPosts(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    return await this.postsQueryRepository.getPostsQueryRepo(queryParam);
  }

  async getPostById(postId: string): Promise<PostOutput> {
    return await this.postsQueryRepository.getPostByIdQueryRepo(postId);
  }
}

export const postQueryService = new PostQueryService();
