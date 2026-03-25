import { ApplicationResult } from "@core/result/application.result";
import { WithMeta } from "@core/types/with-meta.type";
import {
  CreateBlogDtoCommand,
  UpdateBlogDtoCommand,
} from "blogs/application/commands/blog-dto-type.commands";
import { CreatePostForBlogDtoCommand } from "posts/application/commands/create-post-for-blog-dto.command";
import { PostOutput } from "posts/application/output/post-type.output";
import { BlogOutput } from "../output/blog-type.output";

export interface IBlogsService {
  createBlog(
    command: WithMeta<CreateBlogDtoCommand>
  ): Promise<ApplicationResult<BlogOutput | null>>;

  createPostForBlog(
    command: WithMeta<CreatePostForBlogDtoCommand>
  ): Promise<ApplicationResult<PostOutput | null>>;

  updateBlog(
    command: WithMeta<UpdateBlogDtoCommand>
  ): Promise<ApplicationResult<null>>;

  deleteBlog(
    command: WithMeta<{ id: string }>
  ): Promise<ApplicationResult<null>>;
}
