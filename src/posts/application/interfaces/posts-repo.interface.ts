import { PostCommentEntity } from "posts/domain/entities/post-comment.entity";
import { PostEntity } from "posts/domain/entities/post.entity";

export interface IPostsRepo {
  createPost(newPost: PostEntity): Promise<PostEntity>;

  createPostComment(
    domain: PostCommentEntity
  ): Promise<PostCommentEntity | null>;

  updatePost(post: PostEntity): Promise<boolean>;

  deletePost(id: string): Promise<boolean>;
}
