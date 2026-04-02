import { inject, injectable } from "inversify";

import { PostsListPaginatedOutput } from "../output/posts-list-type.output";
import { ApplicationResultStatus } from "@core/result/types/application-result-status.enum";
import { DiTypes } from "@core/di/types";
import { IPostsQueryService } from "@posts/application/interfaces/posts-query-service.interface";
import { IPostsQueryRepo } from "@posts/application/interfaces/posts-query-repo.interface";
import { NotFoundError } from "@core/errors/application.error";
import { ApplicationResult } from "@core/result/application.result";
import { PostCommentsListPaginatedOutput } from "../output/post-comments-list-type.output";
import { GetPostsListQueryHandler } from "../query-handlers/get-posts-list.query-handler";
import { GetPostCommentsListQueryHandler } from "../query-handlers/get-post-comments-list.query-handler";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostMapper } from "@posts/infrastructure/mappers/post.mapper";
import { PostOutput } from "../output/post-type.output";
import { IPostsRepo } from "../interfaces/posts-repo.interface";

@injectable()
export class PostQueryService implements IPostsQueryService {
  constructor(
    @inject(DiTypes.IPostsQueryRepository)
    private postsQueryRepository: IPostsQueryRepo,

    @inject(DiTypes.IPostsRepository) private postsRepo: IPostsRepo
  ) {}

  async getPostsList(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string
  ): Promise<PostsListPaginatedOutput> {
    const { postsEntity, userLikes, totalCount } =
      await this.postsQueryRepository.getPostsList(queryParam, currentUserId);

    return PostMapper.toListViewModel(postsEntity, userLikes, {
      page: queryParam.pageNumber,
      pageSize: queryParam.pageSize,
      totalCount,
    });
  }

  async getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<ApplicationResult<PostOutput | null>> {
    const post = await this.postsQueryRepository.getPostById(
      postId,
      currentUserId
    );

    if (!post) {
      return new ApplicationResult({
        status: ApplicationResultStatus.NotFound,
        data: null,
        extensions: [new NotFoundError("Post is not found!", "postId")],
      });
    }

    let myStatus = LikeStatus.None;

    if (currentUserId) {
      // * лайк конкретного юзера
      const like = await this.postsRepo.findPostLike(postId, currentUserId);

      myStatus = like?.likeStatus ?? LikeStatus.None;
    }

    const postOutput = PostMapper.toViewModel(post, myStatus);

    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data: postOutput,
      extensions: [],
    });
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
