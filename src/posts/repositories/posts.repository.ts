import { ObjectId, WithId } from "mongodb";

import { postCollection } from "../../db/mongo.db";
import { PostDb, PostInputDto } from "../types/post.types";

export const postRepository = {
  async getAllPosts(): Promise<WithId<PostDb>[]> {
    return postCollection.find().toArray();
  },

  async getPostById(postId: string): Promise<WithId<PostDb> | null> {
    return postCollection.findOne({ _id: new ObjectId(postId) }) ?? null;
  },

  async createNewPost(
    dto: PostInputDto,
    blogName: string
  ): Promise<WithId<PostDb>> {
    const newPost: PostDb = {
      // * create on my own
      _id: new ObjectId(),

      // * dto body
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: new ObjectId(dto.blogId),

      // * get name from blog
      blogName: blogName,
      createdAt: new Date(),
    };

    const insertResult = await postCollection.insertOne(newPost);

    return { ...newPost, _id: insertResult.insertedId };
  },

  async updatePost(
    postId: string,
    dto: PostInputDto,
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

  async deletePost(id: string): Promise<void> {
    const deleteResult = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error("Blog not exist");
    }

    return;
  },
};
