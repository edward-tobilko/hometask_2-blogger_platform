import { ClientSession } from "mongoose";

import { PostCommentsListPaginatedOutput } from "posts/application/output/post-comments-list-type.output";
import { PostsListPaginatedOutput } from "posts/application/output/posts-list-type.output";
import { GetPostCommentsListQueryHandler } from "posts/application/query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "posts/application/query-handlers/get-posts-list.query-handler";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostLikeLean } from "posts/infrastructure/schemas/post-like.schema";

export interface IPostsQueryRepo {
  getPostsList(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput>;

  getPostById(
    postId: string,
    session?: ClientSession
  ): Promise<PostEntity | null>;

  getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler,
    currentUserId?: string
  ): Promise<PostCommentsListPaginatedOutput | null>;

  findPostLike(
    postId: string,
    userId: string,
    session: ClientSession
  ): Promise<PostLikeLean | null>;

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
