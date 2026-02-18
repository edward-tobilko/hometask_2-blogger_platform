import { inject, injectable } from "inversify";

import { ApplicationResult } from "./../../core/result/application.result";
import { PostCommentsListPaginatedOutput } from "./output/post-comments-list-type.output";
import { PostOutput } from "./output/post-type.output";
import { PostsListPaginatedOutput } from "./output/posts-list-type.output";
import { GetPostCommentsListQueryHandler } from "./query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "./query-handlers/get-posts-list.query-handler";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { Types } from "@core/di/types";
import { IPostsQueryService } from "posts/interfaces/IPostsQueryService";
import { IPostsQueryRepository } from "posts/interfaces/IPostsQueryRepository";
import { NotFoundError } from "@core/errors/application.error";

@injectable()
export class PostQueryService implements IPostsQueryService {
  constructor(
    @inject(Types.IPostsQueryRepository)
    private postsQueryRepository: IPostsQueryRepository
  ) {}

  async getPostsList(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    return await this.postsQueryRepository.getPostsList(queryParam);
  }

  async getPostById(postId: string): Promise<PostOutput | null> {
    return await this.postsQueryRepository.getPostById(postId);
  }

  async getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler
  ): Promise<ApplicationResult<PostCommentsListPaginatedOutput | null>> {
    const commentsResult =
      await this.postsQueryRepository.getPostCommentsList(queryParam);

    if (!commentsResult) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Post is not found!", "postId")],
      });
    }

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: commentsResult,
      extensions: [],
    });
  }
}
