import { ApplicationResult } from "./../../core/result/application.result";
import { PostQueryRepository } from "../repositories/post-query.repository";
import { PostCommentsListPaginatedOutput } from "./output/post-comments-list-type.output";
import { PostOutput } from "./output/post-type.output";
import { PostsListPaginatedOutput } from "./output/posts-list-type.output";
import { GetPostCommentsListQueryHandler } from "./query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "./query-handlers/get-posts-list.query-handler";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { NotFoundError } from "@core/errors/application.error";

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

  async getPostById(postId: string): Promise<PostOutput | null> {
    return await this.postsQueryRepository.getPostByIdQueryRepo(postId);
  }

  async getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler
  ): Promise<ApplicationResult<PostCommentsListPaginatedOutput | null>> {
    const commentRes =
      await this.postsQueryRepository.getPostCommentsQueryRepo(queryParam);

    if (!commentRes) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Some error", "queryParam")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: commentRes,
      extensions: [],
    });
  }
}

export const postQueryService = new PostQueryService();
