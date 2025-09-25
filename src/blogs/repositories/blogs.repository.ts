import { db } from "../../db/mock.db";
import {
  BloggerInputDtoTypeModel,
  BloggerTypeModel,
} from "../../types/blogger.types";

export const blogsRepository = {
  findAllBlogs(): BloggerTypeModel[] {
    const blogs = db.blogs;

    return blogs;
  },

  findBlogById(id: string): BloggerTypeModel | null {
    return db.blogs.find((blog) => blog.id === id) ?? null;
  },

  createNewBlog(newBlog: BloggerTypeModel): BloggerTypeModel {
    db.blogs.push(newBlog);

    return newBlog;
  },

  updateBlog(id: string, dto: BloggerInputDtoTypeModel): void {
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
