import { ApplicationResult } from "@core/result/application.result";
import { PostCommentsListPaginatedOutput } from "@posts/application/output/post-comments-list-type.output";
import { PostsListPaginatedOutput } from "@posts/application/output/posts-list-type.output";
import { GetPostCommentsListQueryHandler } from "@posts/application/query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "@posts/application/query-handlers/get-posts-list.query-handler";
import { PostOutput } from "../output/post-type.output";

export interface IPostsQueryService {
  getPostsList(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string
  ): Promise<PostsListPaginatedOutput>;

  getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<ApplicationResult<PostOutput | null>>;

  getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler,
    currentUserId?: string
  ): Promise<ApplicationResult<PostCommentsListPaginatedOutput | null>>;
}
