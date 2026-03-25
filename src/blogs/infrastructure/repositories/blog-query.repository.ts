import { injectable } from "inversify";
import { Types } from "mongoose";

import { mapToBlogListOutput } from "../../application/mappers/map-to-blog-list-output.util";
import { BlogListPaginatedOutput } from "../../application/output/blog-list-paginated-type.output";
import { BlogOutput } from "../../application/output/blog-type.output";
import { mapToBlogOutput } from "../../application/mappers/map-to-blog-output.mapper";
import { GetBlogsListQueryHandler } from "../../application/query-handlers/get-blogs-list-type.query-handler";
import { GetPostsListQueryHandler } from "../../../posts/application/query-handlers/get-posts-list.query-handler";
import { RepositoryNotFoundError } from "../../../core/errors/application.error";
import { IBlogsQueryRepository } from "blogs/application/interfaces/IBlogsQueryRepository";
import { BlogLean, BlogModel } from "blogs/infrastructure/schemas/blog.schema";
import { PostLean, PostModel } from "posts/infrastructure/schemas/post.schema";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostEntity } from "posts/domain/entities/post.entity";
import { PostMapper } from "posts/domain/mappers/post.mapper";
import {
  PostLikeLean,
  PostLikeModel,
} from "posts/infrastructure/schemas/post-like.schema";

@injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  async findAllBlogs(
    queryParam: GetBlogsListQueryHandler
  ): Promise<BlogListPaginatedOutput> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParam;

    const nameTerm = searchNameTerm ? searchNameTerm.trim() : null;

    let filter: Record<string, unknown> = {};

    if (nameTerm) {
      filter = {
        // * встроенные операторы mongodb $regex и $options, 'i' - для игнорирования регистра
        name: { $regex: nameTerm, $options: "i" },
      };
    } else {
      filter = {};
    }

    const items = await BlogModel.find(filter)

      // * "asc" (по возрастанию), то mongo используется 1
      // * "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({ [sortBy]: sortDirection })

      // * пропускаем определённое количество док. перед тем, как вернуть нужный набор данных: Например, страница 3, pageSize=10 → пропускает 20 документов.
      .skip((pageNumber - 1) * pageSize)

      // * ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
      .lean<BlogLean[]>()
      .exec();

    const totalCount = await BlogModel.countDocuments(filter);

    const blogsListOutput = mapToBlogListOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return blogsListOutput;
  }

  async findBlogById(blogId: string): Promise<BlogOutput | null> {
    const blog = await BlogModel.findById(blogId).lean<BlogLean>().exec();
    if (!blog) throw new RepositoryNotFoundError("Blog is not found", "blog");

    return mapToBlogOutput(blog);
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

    console.log("currentUserId:", currentUserId);
    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const postIds = cursor.map((postDoc) => postDoc._id);
      console.log(
        "postIds:",
        postIds.map((id) => id.toString())
      );

      const filter = {
        postId: { $in: postIds },
        userId: new Types.ObjectId(currentUserId),
      };

      console.log("likes filter:", {
        postId: { $in: postIds.map((id) => id.toString()) },
        userId: currentUserId,
      });

      // * достаем лайки конкретного юзера
      const likes = await PostLikeModel.find(filter)
        .lean<PostLikeLean[]>()
        .exec();

      console.log("likes found:", likes);

      likes.forEach((like) => {
        userLikes.set(like.postId.toString(), like.likeStatus);
      });

      console.log("userLikes map:", Array.from(userLikes.entries()));
    }

    console.log(
      "postEntity ids:",
      postsEntity.map((p) => p.id.toString())
    );

    return { postsEntity, userLikes, totalCount };
  }
}
