import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import { CreateCommentForPostDtoCommand } from "posts/application/commands/create-comment-for-post-dto.command";
import { CreatePostDtoCommand } from "posts/application/commands/create-post-dto.command";
import { UpdatePostDtoCommand } from "posts/application/commands/update-post-dto.command";
import { IPostCommentOutput } from "posts/application/output/post-comment.output";

export interface IPostsService {
  createPost(
    command: WithMeta<CreatePostDtoCommand>
  ): Promise<ApplicationResult<string | null>>;

  createPostComment(
    command: WithMeta<CreateCommentForPostDtoCommand>
  ): Promise<ApplicationResult<IPostCommentOutput | null>>;

  updatePost(
    command: WithMeta<UpdatePostDtoCommand>
  ): Promise<ApplicationResult<null>>;

  deletePost(id: string): Promise<ApplicationResult<null>>;
}
