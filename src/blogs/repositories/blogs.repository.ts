import { ObjectId, WithId } from "mongodb";

import { blogCollection } from "../../db/mongo.db";
import { BlogDb, BlogInputDto } from "../types/blog.types";

export const blogsRepository = {
  async findAllBlogs(): Promise<WithId<BlogDb>[]> {
    return blogCollection.find().toArray();
  },

  async findBlogById(blogId: string): Promise<WithId<BlogDb> | null> {
    return blogCollection.findOne({ _id: new ObjectId(blogId) }) ?? null;
  },

  async createNewBlog(dto: BlogInputDto): Promise<WithId<BlogDb>> {
    const newBlog: BlogDb = {
      _id: new ObjectId(),
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };

    const insertResult = await blogCollection.insertOne(newBlog);

    return { ...newBlog, _id: insertResult.insertedId };
  },

  async updateBlog(id: string, dto: BlogInputDto): Promise<void> {
    const updateResult = await blogCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      }
    );

    if (updateResult.matchedCount < 1) {
      throw new Error("Blog not exist");
    }

    return;
  },

  async deleteBlog(id: string): Promise<void> {
    const deleteResult = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error("Blog not exist");
    }

    return;
  },
};
