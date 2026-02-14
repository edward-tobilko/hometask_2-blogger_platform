import { WithId } from "mongodb";

import { PostDomain } from "posts/domain/post.domain";
import { BlogDocument } from "blogs/mongoose/blog-schema.mongoose";

export interface IBlogsRepository {
  findBlogByIdReconstitute(blogId: string): Promise<WithId<BlogDocument>>;

  saveBlog(newBlog: BlogDocument): Promise<BlogDocument>;

  savePostForBlog(newPostForBlog: PostDomain): Promise<BlogDocument>;

  deleteBlogById(id: string): Promise<void>;
}
