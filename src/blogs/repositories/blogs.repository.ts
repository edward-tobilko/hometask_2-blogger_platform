import { ObjectId, WithId } from "mongodb";

import { blogCollection } from "../../db/mongo.db";
import {
  BlogDbDocument,
  BlogInputDtoModel,
  BlogsQueryInput,
} from "../types/blog.types";

export const blogsRepository = {
  async findAllBlogsRepo(
    queryDto: BlogsQueryInput
  ): Promise<{ items: WithId<BlogDbDocument>[]; totalCount: number }> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;
    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await blogCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogCollection.countDocuments(filter);

    return { items, totalCount };
  },

  // async findBlogById(blogId: string): Promise<WithId<BlogDbDocument> | null> {
  //   return blogCollection.findOne({ _id: new ObjectId(blogId) }) ?? null;
  // },

  // async createNewBlog(dto: BlogInputDtoModel): Promise<WithId<BlogDbDocument>> {
  //   const newBlog: BlogDbDocument = {
  //     _id: new ObjectId(),
  //     name: dto.name,
  //     description: dto.description,
  //     websiteUrl: dto.websiteUrl,
  //     createdAt: new Date(),
  //     isMembership: false,
  //   };

  //   const insertResult = await blogCollection.insertOne(newBlog);

  //   return { ...newBlog, _id: insertResult.insertedId };
  // },

  // async updateBlog(id: string, dto: BlogInputDtoModel): Promise<void> {
  //   const updateResult = await blogCollection.updateOne(
  //     { _id: new ObjectId(id) },
  //     {
  //       $set: {
  //         name: dto.name,
  //         description: dto.description,
  //         websiteUrl: dto.websiteUrl,
  //       },
  //     }
  //   );

  //   if (updateResult.matchedCount < 1) {
  //     throw new Error("Blog not exist");
  //   }

  //   return;
  // },

  // async deleteBlog(id: string): Promise<void> {
  //   const deleteResult = await blogCollection.deleteOne({
  //     _id: new ObjectId(id),
  //   });

  //   if (deleteResult.deletedCount < 1) {
  //     throw new Error("Blog not exist");
  //   }

  //   return;
  // },
};
