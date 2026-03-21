import { UpdateBlogDtoCommand } from "blogs/application/commands/blog-dto-type.commands";
import { BlogEntity } from "blogs/domain/entities/blog.entity";
import { BlogDb, BlogDocument } from "blogs/infrastructure/schemas/blog.schema";
import { PostDb, PostDocument } from "posts/infrastructure/schemas/post.schema";

export interface IBlogsRepository {
  findById(blogId: string): Promise<BlogEntity | null>;

  saveBlog(newBlog: BlogDb): Promise<BlogDocument>;

  updateBlog(newBlog: UpdateBlogDtoCommand): Promise<BlogDocument>;

  savePostForBlog(newPostForBlog: PostDb): Promise<PostDocument>;

  deleteBlogById(id: string): Promise<void>;
}
