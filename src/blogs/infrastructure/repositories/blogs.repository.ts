import { injectable } from "inversify";
import { Types } from "mongoose";

import { RepositoryNotFoundError } from "../../../core/errors/application.error";
import { IBlogsRepository } from "blogs/application/interfaces/IBlogsRepository";
import { BlogLean, BlogModel } from "blogs/infrastructure/schemas/blog.schema";
import { PostModel } from "posts/infrastructure/schemas/post.schema";
import { BlogEntity } from "blogs/domain/entities/blog.entity";
import { BlogMapper } from "blogs/domain/mappers/blog.mapper";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostMapper } from "posts/domain/mappers/post.mapper";

@injectable()
export class BlogsRepository implements IBlogsRepository {
  async findById(blogId: string): Promise<BlogEntity | null> {
    if (!Types.ObjectId.isValid(blogId)) return null;

    const blogLean = await BlogModel.findById(blogId).lean<BlogLean>().exec();

    if (!blogLean) return null;

    return BlogMapper.toDomain(blogLean);
  }

  async createBlog(newBlog: BlogEntity): Promise<BlogEntity> {
    // * получаем замапенный инстанс дб блога (для динамического смены БД: Mongo -> PostgreSQL)
    const blogDb = BlogMapper.toDb(newBlog);
    const blogInstanceDoc = new BlogModel(blogDb);

    await blogInstanceDoc.save();

    return BlogMapper.toDomain(blogInstanceDoc);
  }

  async updateBlog(blogEntity: BlogEntity): Promise<void> {
    if (!Types.ObjectId.isValid(blogEntity.id)) {
      throw new RepositoryNotFoundError("Blog id is not valid!", "blogId");
    }

    const updatedRes = await BlogModel.findByIdAndUpdate(blogEntity.id, {
      $set: {
        name: blogEntity.name,
        description: blogEntity.description,
        websiteUrl: blogEntity.websiteUrl,
      },
    }).exec(); // * так как почти все методы find... возвр. query object, а не promise, нам нужно доставлять .exec() - который в свою очередь возвр. promise и лучшую типизацию.

    if (!updatedRes) {
      throw new RepositoryNotFoundError("Blog is not exist!", "blogId");
    }
  }

  async createPostForBlog(postForBlogEntity: PostEntity): Promise<PostEntity> {
    const postDocument = PostMapper.toDb(postForBlogEntity);
    const postInstanceDoc = new PostModel(postDocument);

    await postInstanceDoc.save();

    return PostMapper.toDomain(postInstanceDoc);
  }

  async deleteBlogById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError("Blog id is not valid", "blogId");
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
