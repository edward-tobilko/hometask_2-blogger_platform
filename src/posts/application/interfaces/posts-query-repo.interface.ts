import { ClientSession } from "mongoose";

import { PostCommentsListPaginatedOutput } from "@posts/application/output/post-comments-list-type.output";
import { GetPostCommentsListQueryHandler } from "@posts/application/query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "@posts/application/query-handlers/get-posts-list.query-handler";
import { PostEntity } from "@posts/domain/entities/post.entity";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostLikeView } from "./posts-repo.interface";

export interface IPostsQueryRepo {
  getPostsList(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string
  ): Promise<{
    postsEntity: PostEntity[];
    userLikes: Map<string, LikeStatus>;
    totalCount: number;
  }>;

  getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<PostEntity | null>;

  getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler,
    currentUserId?: string
  ): Promise<PostCommentsListPaginatedOutput | null>;

  findPostLike(
    postId: string,
    userId: string,
    session?: ClientSession
  ): Promise<PostLikeView | null>;

  getNewestLikes(
    postId: string,
    session: ClientSession
  ): Promise<
    Array<{
      addedAt: Date;
      userId: string;
      login: string;
    }>
  >;
}
