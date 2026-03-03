import { inject, injectable } from "inversify";

import { PostsListPaginatedOutput } from "../output/posts-list-type.output";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { DiTypes } from "@core/di/types";
import { IPostsQueryService } from "posts/application/interfaces/posts-query-service.interface";
import { IPostsQueryRepo } from "posts/application/interfaces/posts-query-repo.interface";
import { NotFoundError } from "@core/errors/application.error";
import { ApplicationResult } from "@core/result/application.result";
import { PostCommentsListPaginatedOutput } from "../output/post-comments-list-type.output";
import { GetPostsListQueryHandler } from "../query-handlers/get-posts-list.query-handler";
import { GetPostCommentsListQueryHandler } from "../query-handlers/get-post-comments-list.query-handler";
import { PostEntity } from "posts/domain/entities/post.entity";

@injectable()
export class PostQueryService implements IPostsQueryService {
  constructor(
    @inject(DiTypes.IPostsQueryRepository)
    private postsQueryRepository: IPostsQueryRepo
  ) {}

  async getPostsList(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    return await this.postsQueryRepository.getPostsList(queryParam);
  }

  async getPostById(postId: string): Promise<PostEntity | null> {
    return await this.postsQueryRepository.getPostById(postId);
  }

  async getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler,
    currentUserId?: string
  ): Promise<ApplicationResult<PostCommentsListPaginatedOutput | null>> {
    const commentsResult = await this.postsQueryRepository.getPostCommentsList(
      queryParam,
      currentUserId
    );

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
