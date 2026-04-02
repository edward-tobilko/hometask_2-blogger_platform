import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import { CreateCommentForPostDtoCommand } from "@posts/application/commands/create-comment-for-post-dto.command";
import { CreatePostDtoCommand } from "@posts/application/commands/create-post-dto.command";
import { UpdatePostDtoCommand } from "@posts/application/commands/update-post-dto.command";
import { IPostCommentOutput } from "@posts/application/output/post-comment.output";
import { PostOutput } from "../output/post-type.output";
import { LikeStatus } from "@core/types/like-status.enum";

export interface IPostsService {
  createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<PostOutput | null>>;

  createPostComment(
    command: WithMeta<CreateCommentForPostDtoCommand>
  ): Promise<ApplicationResult<IPostCommentOutput | null>>;

  updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>>;

  deletePost(id: string): Promise<ApplicationResult<null>>;

  upsertPostLike(domain: {
    postId: string;
    userId: string;
    likeStatus: LikeStatus;
  }): Promise<ApplicationResult<null>>;
}
