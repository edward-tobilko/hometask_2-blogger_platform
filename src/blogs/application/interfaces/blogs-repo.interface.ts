import { BlogEntity } from "@blogs/domain/entities/blog.entity";
import { PostEntity } from "@posts/domain/entities/post.entity";

export interface IBlogsRepository {
  findById(blogId: string): Promise<BlogEntity | null>;

  createBlog(newBlog: BlogEntity): Promise<BlogEntity>;

  updateBlog(blogEntity: BlogEntity): Promise<void>;

  createPostForBlog(postForBlogEntity: PostEntity): Promise<PostEntity>;

  deleteBlogById(id: string): Promise<void>;
}
