import { UpdatePostDtoCommand } from "posts/application/commands/update-post-dto.command";
import {
  PostCommentsDb,
  PostCommentsDocument,
} from "posts/mongoose/post-comments.schema";
import { PostDb, PostDocument } from "posts/mongoose/post.schema";

export interface IPostsRepository {
  createPost(newPost: PostDb): Promise<PostDocument>;

  createPostComment(
    newPostComment: PostCommentsDb
  ): Promise<PostCommentsDocument>;

  updatePost(dto: UpdatePostDtoCommand): Promise<boolean | "BLOG_MISMATCH">;

  deletePost(id: string): Promise<boolean>;
}
