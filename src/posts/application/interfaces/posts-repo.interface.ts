import { ClientSession } from "mongoose";

import { LikeStatus } from "@core/types/like-status.enum";
import { PostCommentEntity } from "@posts/domain/entities/post-comment.entity";
import { PostEntity } from "@posts/domain/entities/post.entity";

export type PostLikeView = {
  likeStatus: LikeStatus;
  login: string;
};

export interface IPostsRepo {
  findById(postId: string, session?: ClientSession): Promise<PostEntity | null>;

  createAndSavePost(newPost: PostEntity): Promise<PostEntity>;

  createPostComment(
    domain: PostCommentEntity
  ): Promise<PostCommentEntity | null>;

  updatePost(post: PostEntity): Promise<boolean>;

  deletePost(id: string): Promise<boolean>;

  updateLikeCounters(
    postId: string,
    like: number,
    dislike: number,
    session: ClientSession
  ): Promise<void>;

  upsertPostLike(
    domain: {
      postId: string;
      userId: string;
      likeStatus: LikeStatus;
      login: string;
    },
    session: ClientSession
  ): Promise<void>;

  setNewestLikes(
    postId: string,
    newestLikes: Array<{ addedAt: Date; userId: string; login: string }>,
    session: ClientSession
  ): Promise<void>;
}
