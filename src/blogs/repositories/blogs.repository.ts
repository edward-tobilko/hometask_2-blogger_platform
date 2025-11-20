import { blogCollection, postCollection } from "../../db/mongo.db";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { BlogDomain } from "../domain/blog.domain";

export class BlogsRepository {
  async saveBlogRepo(newBlog: BlogDomain): Promise<BlogDomain> {
    if (!newBlog._id) {
      const insertResult = await blogCollection.insertOne(newBlog);

      newBlog._id = insertResult.insertedId;

      return newBlog;
    } else {
      // * Обновить данные блога (отправляем весь обьект)
      const { _id, ...dtoToUpdate } = newBlog;

      const updateResult = await blogCollection.updateOne(
        {
          _id,
        },
        {
          $set: {
            ...dtoToUpdate,
          },
        }
      );

      // * проверяем, если блог не найден, то выбрасываем ошибку
      if (updateResult.matchedCount < 1) {
        throw new RepositoryNotFoundError("Blog is not exist!");
      }

      return newBlog;
    }
  }
  // async createPostForBlogRepo(
  //   newPostForBlog: PostDbDocument
  // ): Promise<WithId<PostDbDocument>> {
  //   const insertedResult: InsertOneResult =
  //     await postCollection.insertOne(newPostForBlog);
  //   return { ...newPostForBlog, _id: insertedResult.insertedId };
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
