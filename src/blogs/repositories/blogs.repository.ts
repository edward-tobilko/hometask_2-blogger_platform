import { injectable } from "inversify";
import { Types } from "mongoose";

import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { IBlogsRepository } from "blogs/interfaces/IBlogsRepository";
import { BlogDocument, BlogModel } from "blogs/mongoose/blog-schema.mongoose";
import { PostDocument, PostModel } from "posts/mongoose/post-schema.mongoose";

@injectable()
export class BlogsRepository implements IBlogsRepository {
  async saveBlog(newBlog: BlogDocument): Promise<BlogDocument> {
    if (!newBlog._id) {
      const createdResult = await BlogModel.create(newBlog);

      createdResult.save();

      return createdResult;
    }

    const updateResult = await BlogModel.updateOne(
      {
        _id: newBlog._id,
      },
      {
        $set: {
          name: newBlog.name,
          description: newBlog.description,
          websiteUrl: newBlog.websiteUrl,
          isMembership: newBlog.isMembership,
        },
      }
    );

    if (updateResult.matchedCount < 1) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    return newBlog;
  }

  async savePostForBlog(newPostForBlog: PostDocument): Promise<BlogDocument> {
    if (!newPostForBlog._id) {
      const createdResult = await BlogModel.create(newPostForBlog);

      createdResult.save();

      return newPostForBlog;
    } else {
      const { _id, ...dtoToUpdate } = newPostForBlog;

      const updateResult = await PostModel.updateOne(
        {
          _id: newPostForBlog._id,
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
    if (!Types.ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError("Blog is not valid", "blogId");
    }

    const deleteResult = await BlogModel.deleteOne({
      _id: new Types.ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    return;
  }
}
