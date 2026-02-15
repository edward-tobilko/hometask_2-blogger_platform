import { UpdateBlogDtoCommand } from "blogs/application/commands/blog-dto-type.commands";
import { BlogDb, BlogDocument } from "blogs/mongoose/blog-schema.mongoose";
import { UpdatePostDtoCommand } from "posts/application/commands/update-post-dto.command";
import { PostDb, PostDocument } from "posts/mongoose/post-schema.mongoose";

export interface IBlogsRepository {
  saveBlog(newBlog: BlogDb): Promise<BlogDocument>;

  updateBlog(newBlog: UpdateBlogDtoCommand): Promise<BlogDocument>;

  savePostForBlog(newPostForBlog: PostDb): Promise<PostDocument>;

  updatePostForBlog(
    newPostForBlog: UpdatePostDtoCommand
  ): Promise<PostDocument>;

  deleteBlogById(id: string): Promise<void>;
}
