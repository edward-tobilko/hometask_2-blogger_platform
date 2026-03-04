import { UpdateBlogDtoCommand } from "blogs/application/commands/blog-dto-type.commands";
import { BlogDb, BlogDocument } from "blogs/mongoose/blog-schema.mongoose";
import { PostDb, PostDocument } from "posts/infrastructure/schemas/post.schema";

export interface IBlogsRepository {
  saveBlog(newBlog: BlogDb): Promise<BlogDocument>;

  updateBlog(newBlog: UpdateBlogDtoCommand): Promise<BlogDocument>;

  savePostForBlog(newPostForBlog: PostDb): Promise<PostDocument>;

  deleteBlogById(id: string): Promise<void>;
}
