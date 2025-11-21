import { ObjectId, WithId } from "mongodb";

import { postCollection } from "../../db/mongo.db";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { PostDomain } from "../domain/post.domain";

export class PostsRepository {
  // async getPostByIdRepo(postId: string): Promise<WithId<PostDbDocument>> {
  //   const result = await postCollection.findOne({ _id: new ObjectId(postId) });
  //   if (!result) {
  //     throw new RepositoryNotFoundError("postId is not exist");
  //   }
  //   return result;
  // }

  async savePostRepo(newPost: PostDomain): Promise<PostDomain> {
    if (!newPost._id) {
      const insertResult = await postCollection.insertOne(newPost);

      newPost._id = insertResult.insertedId;

      return newPost;
    } else {
      const { _id, ...dtoToUpdate } = newPost;

      const updateResult = await postCollection.updateOne(
        { _id },
        { $set: { ...dtoToUpdate } }
      );

      if (updateResult.matchedCount < 1) {
        throw new RepositoryNotFoundError("Post is not exist!");
      }

      return newPost;
    }
  }

  // async updatePostRepo(
  //   postId: string,
  //   dto: PostInputDtoModel,
  //   blogName: string
  // ): Promise<void> {
  //   const updateResult = await postCollection.updateOne(
  //     { _id: new ObjectId(postId) },
  //     {
  //       $set: {
  //         title: dto.title,
  //         shortDescription: dto.shortDescription,
  //         content: dto.content,
  //         blogId: new ObjectId(dto.blogId),
  //         blogName,
  //       },
  //     }
  //   );
  //   if (updateResult.matchedCount < 1) {
  //     throw new Error("Post not exist");
  //   }
  //   return;
  // }
  // async deletePostRepo(id: string): Promise<void> {
  //   const deleteResult = await postCollection.deleteOne({
  //     _id: new ObjectId(id),
  //   });
  //   if (deleteResult.deletedCount < 1) {
  //     throw new Error("Post not exist");
  //   }
  //   return;
  // }
}
