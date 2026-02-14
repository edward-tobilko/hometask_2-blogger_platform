import { injectable } from "inversify";
import { Types } from "mongoose";

import { mapToBlogListOutput } from "../application/mappers/map-to-blog-list-output.util";
import { BlogListPaginatedOutput } from "../application/output/blog-list-paginated-type.output";
import { BlogOutput } from "../application/output/blog-type.output";
import { mapToBlogOutput } from "../application/mappers/map-to-blog-output.mapper";
import { mapToPostListOutput } from "../../posts/application/mappers/map-to-post-list-output.util";
import { PostsListPaginatedOutput } from "../../posts/application/output/posts-list-type.output";
import { GetBlogsListQueryHandler } from "../application/query-handlers/get-blogs-list-type.query-handler";
import { GetPostsListQueryHandler } from "../../posts/application/query-handlers/get-posts-list.query-handler";
import { RepositoryNotFoundError } from "../../core/errors/application.error";
import { IBlogsQueryRepository } from "blogs/interfaces/IBlogsQueryRepository";
import { BlogLean, BlogModel } from "blogs/mongoose/blog-schema.mongoose";
import { PostLean, PostModel } from "posts/mongoose/post-schema.mongoose";

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

  async findBlogById(blogId: string): Promise<BlogOutput> {
    const blog = await BlogModel.findOne({ _id: new Types.ObjectId(blogId) })
      .lean<BlogLean>()
      .exec();

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    return mapToBlogOutput(blog);
  }

  async findAllPostsForBlog(
    queryParam: GetPostsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    const { pageNumber, pageSize, sortBy, sortDirection, blogId } = queryParam;

    const blogObjectId = new Types.ObjectId(blogId);

    const filter = { blogId: blogObjectId };

    const blog = await BlogModel.findOne({ _id: blogObjectId })
      .lean<BlogLean>()
      .exec();

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    const cursor = PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const [postsForBlog, totalCount] = await Promise.all([
      cursor.lean<PostLean[]>().exec(),
      PostModel.countDocuments(filter),
    ]);

    const postListForBlogOutput = mapToPostListOutput(postsForBlog, {
      page: pageNumber,
      pageSize,
      totalCount,
    });

    return postListForBlogOutput;
  }
}
