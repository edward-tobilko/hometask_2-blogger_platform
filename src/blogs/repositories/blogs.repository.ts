import { BlogInputDtoTypeModel, BlogTypeModel } from "../types/blog.types";

export const blogsRepository = {
  findAllBlogs(): BlogTypeModel[] {
    const blogs = db.blogs;

    return blogs;
  },

  findBlogById(id: string): BlogTypeModel | null {
    return db.blogs.find((blog) => blog.id === id) ?? null;
  },

  createNewBlog(newBlog: BlogTypeModel): BlogTypeModel {
    db.blogs.push(newBlog);

    return newBlog;
  },

  updateBlog(id: string, dto: BlogInputDtoTypeModel): void {
    const blog = db.blogs.find((blog) => blog.id === id);

    if (!blog) {
      throw new Error("Blog not exist");
    }

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return;
  },

  deleteBlog(id: string): void {
    const deletedBlog = db.blogs.findIndex((indexBlog) => indexBlog.id === id);

    db.blogs.splice(deletedBlog, 1);

    return;
  },
};
