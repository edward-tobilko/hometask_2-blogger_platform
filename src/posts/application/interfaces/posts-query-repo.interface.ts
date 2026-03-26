import { ClientSession } from "mongoose";

import { PostCommentsListPaginatedOutput } from "posts/application/output/post-comments-list-type.output";
import { GetPostCommentsListQueryHandler } from "posts/application/query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "posts/application/query-handlers/get-posts-list.query-handler";
import { PostEntity } from "posts/domain/entities/post.entity";
import { LikeStatus } from "@core/types/like-status.enum";

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
    session?: ClientSession,
    currentUserId?: string
  ): Promise<PostEntity | null>;

  getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler,
    currentUserId?: string
  ): Promise<PostCommentsListPaginatedOutput | null>;

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
