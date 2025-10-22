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

    const items = await postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async getPostByIdRepo(postId: string): Promise<WithId<PostDbDocument>> {
    const result = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!result) {
      throw new RepositoryNotFoundError("Post is not exist");
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
  ): Promise<void> {
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

    if (updateResult.matchedCount < 1) {
      throw new Error("Post not exist");
    }

    return;
  },

  async deletePostRepo(id: string): Promise<void> {
    const deleteResult = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error("Post not exist");
    }

    return;
  },
};
