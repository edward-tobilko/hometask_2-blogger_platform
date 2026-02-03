import { ObjectId } from "mongodb";

import { PostCommentDomain } from "posts/domain/post-comment.domain";
import { PostDomain } from "posts/domain/post.domain";

export interface IPostsRepository {
  getPostDomainById(postId: string): Promise<PostDomain | null>;

  createPost(newPost: PostDomain): Promise<PostDomain>;

  createPostComment(newPostComment: PostCommentDomain): Promise<ObjectId>;

  updatePost(postDomain: PostDomain): Promise<PostDomain>;

  deletePost(id: string): Promise<boolean>;
}
