import { PostCommentsListPaginatedOutput } from "posts/application/output/post-comments-list-type.output";
import { PostOutput } from "posts/application/output/post-type.output";
import { PostsListPaginatedOutput } from "posts/application/output/posts-list-type.output";
import { GetPostCommentsListQueryHandler } from "posts/application/query-handlers/get-post-comments-list.query-handler";
import { GetPostsListQueryHandler } from "posts/application/query-handlers/get-posts-list.query-handler";

export interface IPostsQueryRepository {
  getPostsList(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput>;

  getPostById(postId: string): Promise<PostOutput | null>;

  getPostCommentsList(
    queryParam: GetPostCommentsListQueryHandler
  ): Promise<PostCommentsListPaginatedOutput | null>;
}
