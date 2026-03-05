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
import { LikeStatus } from "@core/types/like-status.enum";
import { PostMapper } from "posts/domain/mappers/post.mapper";

@injectable()
export class PostQueryService implements IPostsQueryService {
  constructor(
    @inject(DiTypes.IPostsQueryRepository)
    private postsQueryRepository: IPostsQueryRepo
  ) {}

  async getPostsList(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string
  ): Promise<PostsListPaginatedOutput> {
    const { postsEntity, userLikes, totalCount } =
      await this.postsQueryRepository.getPostsList(queryParam, currentUserId);

    const items = postsEntity.map((postEntity) => {
      const myStatus =
        userLikes.get(postEntity.id.toString()) ?? LikeStatus.None;

      return PostMapper.toViewModel(postEntity, myStatus);
    });

    return {
      pagesCount: Math.ceil(totalCount / queryParam.pageSize),
      page: queryParam.pageNumber,
      pageSize: queryParam.pageSize,
      totalCount,
      items,
    };
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
