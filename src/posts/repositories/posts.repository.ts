import { ObjectId, WithId } from "mongodb";

import { postCollection } from "../../db/mongo.db";
import {
  PostDbDocument,
  PostInputDtoModel,
  PostQueryParamInput,
} from "../types/post.types";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";

export const postsRepository = {
  async getAllPostsRepo(queryParam: PostQueryParamInput): Promise<{
    items: WithId<PostDbDocument>[];
    totalCount: number;
  }> {
    const filter = {};

    const { pageNumber, pageSize, sortDirection, sortBy } = queryParam;

    const sortDirectionValue = sortDirection === "asc" ? 1 : -1;

    const items = await postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirectionValue })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async getPostByIdRepo(postId: string): Promise<WithId<PostDbDocument>> {
    const result = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!result) {
      throw new RepositoryNotFoundError("postId is not exist");
    }

    return result;
  },

  async createPostRepo(
    dto: PostInputDtoModel,
    blogName: string
  ): Promise<WithId<PostDbDocument>> {
    const newPost: PostDbDocument = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(dto.blogId),

      blogName: blogName,
      createdAt: new Date(),
    };

    const insertResult = await postCollection.insertOne(newPost);

    return { ...newPost, _id: insertResult.insertedId };
  },

  async updatePostRepo(
    postId: string,
    dto: PostInputDtoModel,
    blogName: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(postId)) return false;

    const updateResult = await postCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: new ObjectId(dto.blogId),
          blogName,
        },
      }
    );

    return updateResult.matchedCount === 1;
  },

  async deletePostRepo(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const deleteResult = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return deleteResult.deletedCount === 1;
  },
};
