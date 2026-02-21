import { Types } from "mongoose";

import { UpdatePostDtoCommand } from "posts/application/commands/update-post-dto.command";
import { PostCommentsDocument } from "posts/mongoose/post-comments.schema";
import { PostDb, PostDocument } from "posts/mongoose/post.schema";

export interface IPostsRepository {
  createPost(newPost: PostDb): Promise<PostDocument>;

  createPostComment(dto: {
    content: string;
    postId: Types.ObjectId;
    commentatorInfo: {
      userId: Types.ObjectId;
      userLogin: string;
    };
  }): Promise<PostCommentsDocument | null>;

  updatePost(dto: UpdatePostDtoCommand): Promise<boolean | "BLOG_MISMATCH">;

  deletePost(id: string): Promise<boolean>;
}
