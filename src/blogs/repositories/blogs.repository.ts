import { InsertOneResult, ObjectId, WithId } from "mongodb";
import { injectable } from "inversify";

import { blogCollection, postCollection } from "../../db/mongo.db";
import { BlogDomain } from "../domain/blog.domain";
import { PostDomain } from "../../posts/domain/post.domain";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { IBlogsRepository } from "blogs/interfaces/IBlogsRepository";

@injectable()
export class BlogsRepository implements IBlogsRepository {
  async findBlogByIdReconstitute(blogId: string): Promise<WithId<BlogDomain>> {
    const blog = await blogCollection.findOne({ _id: new ObjectId(blogId) });

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    return BlogDomain.reconstitute(blog);
  }

  async saveBlog(newBlog: BlogDomain): Promise<BlogDomain> {
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
            name: dtoToUpdate.name,
            description: dtoToUpdate.description,
            websiteUrl: dtoToUpdate.websiteUrl,
            isMembership: dtoToUpdate.isMembership,
          },
        }
      );

      // * проверяем, если блог не найден, то выбрасываем ошибку
      if (updateResult.matchedCount < 1) {
        throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
      }

      return newBlog;
    }
  }

  async savePostForBlog(newPostForBlog: PostDomain): Promise<PostDomain> {
    if (!newPostForBlog._id) {
      const insertResult: InsertOneResult =
        await postCollection.insertOne(newPostForBlog);

      newPostForBlog._id = insertResult.insertedId;

      return newPostForBlog;
    } else {
      const { _id, ...dtoToUpdate } = newPostForBlog;

      const updateResult = await postCollection.updateOne(
        {
          _id,
        },
        {
          $set: dtoToUpdate,
        }
      );

      if (updateResult.matchedCount < 1) {
        throw new RepositoryNotFoundError(
          "Post for blog does't exist!",
          "postForBlogId"
        );
      }

      return newPostForBlog;
    }
  }

  async deleteBlogById(id: string): Promise<void> {
    const deleteResult = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    return;
  }
}
