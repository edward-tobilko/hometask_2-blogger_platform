import { injectable } from "inversify";
import { Types } from "mongoose";

import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { IBlogsRepository } from "blogs/interfaces/IBlogsRepository";
import {
  BlogDb,
  BlogDocument,
  BlogModel,
} from "blogs/mongoose/blog-schema.mongoose";
import {
  PostDb,
  PostDocument,
  PostModel,
} from "posts/infrastructure/schemas/post.schema";
import { UpdateBlogDtoCommand } from "blogs/application/commands/blog-dto-type.commands";

@injectable()
export class BlogsRepository implements IBlogsRepository {
  async saveBlog(newBlog: BlogDb): Promise<BlogDocument> {
    // * Проверку на id можно не делать, так как mongoose всегда создает _id (HydratedDocument всегда имеет _id).
    const blogDocument = new BlogModel(newBlog);

    await blogDocument.save();

    return blogDocument;
  }

  async updateBlog(dto: UpdateBlogDtoCommand): Promise<BlogDocument> {
    if (!Types.ObjectId.isValid(dto.id)) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    const updatedRes = await BlogModel.findByIdAndUpdate(
      dto.id,
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
      { new: true } // * для получения обновленого блога, без "new" вернется старый объект.
    ).exec(); // * так как почти все методы find... возвр. query object, а не promise, нам нужно доставлять .exec() - который в свою очередь возвр. promise и лучшую типизацию.

    if (!updatedRes) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }

    return updatedRes;
  }

  async savePostForBlog(newPostForBlog: PostDb): Promise<PostDocument> {
    const postDocument = new PostModel(newPostForBlog);

    await postDocument.save();

    return postDocument;
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
