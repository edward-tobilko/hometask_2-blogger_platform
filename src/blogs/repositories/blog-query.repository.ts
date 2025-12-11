import { ObjectId } from "mongodb";

import { blogCollection, postCollection } from "../../db/mongo.db";
import { mapToBlogListOutput } from "../application/mappers/map-to-blog-list-output.util";
import { BlogListPaginatedOutput } from "../application/output/blog-list-paginated-type.output";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { BlogOutput } from "../application/output/blog-type.output";
import { mapToBlogOutput } from "../application/mappers/map-to-blog-output.mapper";
import { mapToPostListOutput } from "../../posts/application/mappers/map-to-post-list-output.util";
import { PostsListPaginatedOutput } from "../../posts/application/output/posts-list-type.output";
import { GetBlogsListQueryHandler } from "../application/query-handlers/get-blogs-list-type.query-handler";

export class BlogQueryRepository {
  async findAllBlogsQueryRepo(
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

    console.log("BLOG FILTER:", JSON.stringify(filter, null, 2));

    const items = await blogCollection
      .find(filter)

      // * "asc" (по возрастанию), то mongo используется 1
      // * "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
      .sort({ [sortBy]: sortDirection })

      // * пропускаем определённое количество док. перед тем, как вернуть нужный набор данных: Например, страница 3, pageSize=10 → пропускает 20 документов.
      .skip((pageNumber - 1) * pageSize)

      // * ограничивает количество возвращаемых документов до значения pageSize
      .limit(pageSize)
      .toArray();

    const totalCount = await blogCollection.countDocuments(filter);

    const blogsListOutput = mapToBlogListOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return blogsListOutput;
  }

  async findBlogByIdQueryRepo(blogId: string): Promise<BlogOutput> {
    const blog = await blogCollection.findOne({ _id: new ObjectId(blogId) });

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    return mapToBlogOutput(blog);
  }

  async findAllPostsForBlogQueryRepo(
    queryParam: GetBlogsListQueryHandler
  ): Promise<PostsListPaginatedOutput> {
    const { pageNumber, pageSize, sortBy, sortDirection, blogId } = queryParam;

    const blogObjectId = new ObjectId(blogId);

    const filter = { blogId: blogObjectId };

    const blog = await blogCollection.findOne({ _id: blogObjectId });

    if (!blog) {
      throw new RepositoryNotFoundError("Blog is not exist!");
    }

    const cursor = postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const [postsForBlog, totalCount] = await Promise.all([
      cursor.toArray(),
      postCollection.countDocuments(filter),
    ]);

    const postListForBlogOutput = mapToPostListOutput(postsForBlog, {
      page: pageNumber,
      pageSize,
      totalCount,
    });

    return postListForBlogOutput;
  }
}
