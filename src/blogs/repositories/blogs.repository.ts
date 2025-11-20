import { InsertOneResult, ObjectId, WithId } from "mongodb";

import { blogCollection, postCollection } from "../../db/mongo.db";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { PostDbDocument } from "../../posts/types/post.types";

export class BlogsRepository {
  // async createBlogRepo(
  //   dto: BlogInputDtoModel
  // ): Promise<WithId<BlogDbDocument>> {
  //   const newBlog = {
  //     name: dto.name,
  //     description: dto.description,
  //     websiteUrl: dto.websiteUrl,
  //     createdAt: new Date(),
  //     isMembership: true,
  //   };
  //   const insertedResult = await blogCollection.insertOne(newBlog);
  //   return { ...newBlog, _id: insertedResult.insertedId };
  // }
  // async createPostForBlogRepo(
  //   newPostForBlog: PostDbDocument
  // ): Promise<WithId<PostDbDocument>> {
  //   const insertedResult: InsertOneResult =
  //     await postCollection.insertOne(newPostForBlog);
  //   return { ...newPostForBlog, _id: insertedResult.insertedId };
  // }
  // async updateBlogRepo(id: string, dto: BlogInputDtoModel): Promise<void> {
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
  // }
  // async deleteBlogRepo(id: string): Promise<void> {
  //   const deleteResult = await blogCollection.deleteOne({
  //     _id: new ObjectId(id),
  //   });
  //   if (deleteResult.deletedCount < 1) {
  //     throw new Error("Blog not exist");
  //   }
  //   return;
  // }
}
