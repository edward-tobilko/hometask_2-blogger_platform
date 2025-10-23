import { InsertOneResult, ObjectId, WithId } from "mongodb";

import { blogCollection, postCollection } from "../../db/mongo.db";
import {
  BlogDbDocument,
  BlogInputDtoModel,
  BlogQueryParamInput,
} from "../types/blog.types";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { PostDbDocument } from "../../posts/types/post.types";

export const blogsRepository = {
  async findAllBlogsRepo(
    queryDto: BlogQueryParamInput
  ): Promise<{ items: WithId<BlogDbDocument>[]; totalCount: number }> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;
    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: "i" };
    }

    const sortDirectionValue = sortDirection === "asc" ? 1 : -1;

    const items = await blogCollection
      .find(filter)
      .sort({ [sortBy]: sortDirectionValue })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findBlogByIdRepo(blogId: string): Promise<WithId<BlogDbDocument>> {
    const result = await blogCollection.findOne({ _id: new ObjectId(blogId) });

    if (!result) {
      throw new RepositoryNotFoundError("blogId is not exist");
    }

    return result;
  },

  async createBlogRepo(
    dto: BlogInputDtoModel
  ): Promise<WithId<BlogDbDocument>> {
    const newBlog: BlogDbDocument = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
      createdAt: new Date(),
    };

    const insertedResult = await blogCollection.insertOne(newBlog);

    return { ...newBlog, _id: insertedResult.insertedId };
  },

  async createPostForBlogRepo(
    newPostForBlog: PostDbDocument
  ): Promise<WithId<PostDbDocument>> {
    const insertedResult: InsertOneResult =
      await postCollection.insertOne(newPostForBlog);

    return { ...newPostForBlog, _id: insertedResult.insertedId };
  },

  async getAllPostsForBlogRepo(
    queryDto: BlogQueryParamInput
  ): Promise<{ postsForBlog: WithId<PostDbDocument>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, blogId } = queryDto;

    const filter = { blogId: new ObjectId(blogId) };

    const cursor = postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const [postsForBlog, totalCount] = await Promise.all([
      cursor.toArray(),
      postCollection.countDocuments(filter),
    ]);

    return { postsForBlog, totalCount };
  },

  async updateBlogRepo(id: string, dto: BlogInputDtoModel): Promise<void> {
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

  async deleteBlogRepo(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const deleteResult = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return deleteResult.deletedCount === 1;
  },
};
