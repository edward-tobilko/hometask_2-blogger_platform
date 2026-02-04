import { WithId } from "mongodb";

import { BlogDomain } from "blogs/domain/blog.domain";
import { PostDomain } from "posts/domain/post.domain";

export interface IBlogsRepository {
  findBlogByIdReconstitute(blogId: string): Promise<WithId<BlogDomain>>;

  saveBlog(newBlog: BlogDomain): Promise<BlogDomain>;

  savePostForBlog(newPostForBlog: PostDomain): Promise<PostDomain>;

  deleteBlogById(id: string): Promise<void>;
}
