import { injectable } from "inversify";
import { Types } from "mongoose";

import { BlogListPaginatedOutput } from "../../application/output/blog-list-paginated-type.output";
import { BlogOutput } from "../../application/output/blog-type.output";
import { GetBlogsListQueryHandler } from "../../application/query-handlers/get-blogs-list-type.query-handler";
import { GetPostsListQueryHandler } from "../../../posts/application/query-handlers/get-posts-list.query-handler";
import { RepositoryNotFoundError } from "../../../core/errors/application.error";
import { IBlogsQueryRepository } from "blogs/application/interfaces/blogs-query-repo.interface";
import { BlogLean, BlogModel } from "blogs/infrastructure/schemas/blog.schema";
import { PostLean, PostModel } from "posts/infrastructure/schemas/post.schema";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostMapper } from "posts/domain/mappers/post.mapper";
import {
  PostLikeLean,
  PostLikeModel,
} from "posts/infrastructure/schemas/post-like.schema";
import { BlogMapper } from "blogs/domain/mappers/blog.mapper";

@injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  async findAllBlogs(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    const filter = nameTerm
      ? {
          name: { $regex: nameTerm, $options: "i" },
        }
      : {};

    const [items, totalCount] = await Promise.all([
      BlogModel.find(filter)
        .sort({ [sortBy]: sortDirection })

        .skip((pageNumber - 1) * pageSize)

        .limit(pageSize)
        .lean<BlogLean[]>()
        .exec(),

      BlogModel.countDocuments(filter),
    ]);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,

      items: items.map(BlogMapper.toViewModel),
    };
  }

  async findBlogById(blogId: string): Promise<BlogOutput | null> {
    const blog = await BlogModel.findById(blogId).lean<BlogLean>().exec();
    if (!blog) return null;

    return BlogMapper.toViewModel(blog);
  }

  async findAllPostsForBlog(
    queryParam: GetPostsListQueryHandler,
    currentUserId?: string // * Опционально - для неавторизованных пользователей
  ): Promise<{
    postsEntity: PostEntity[];
    userLikes: Map<string, LikeStatus>;
    totalCount: number;
  }> {
    const { pageNumber, pageSize, sortBy, sortDirection, blogId } = queryParam;
    const blogObjectId = new Types.ObjectId(blogId);

    const blogExists = await BlogModel.exists({ _id: blogObjectId });

    if (!blogExists) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    // * создаем коллекцию для лайков
    const userLikes = new Map<string, LikeStatus>();

    // * фильтруем (получаем) все посты этого блога
    const filter = { blogId: blogObjectId };

    // * достаем эти посты
    const cursor = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean<PostLean[]>()
      .exec();

    // * считаем сумму постов
    const totalCount = await PostModel.countDocuments(filter);

    // * мапим в domain entity
    const postsEntity = cursor.map((postDoc) => PostMapper.toDomain(postDoc));

    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const postIds = cursor.map((postDoc) => postDoc._id);

      const filter = {
        postId: { $in: postIds },
        userId: new Types.ObjectId(currentUserId),
      };

      // * достаем лайки конкретного юзера
      const likes = await PostLikeModel.find(filter)
        .lean<PostLikeLean[]>()
        .exec();

      likes.forEach((like) => {
        userLikes.set(like.postId.toString(), like.likeStatus);
      });
    }

    return { postsEntity, userLikes, totalCount };
  }
}
