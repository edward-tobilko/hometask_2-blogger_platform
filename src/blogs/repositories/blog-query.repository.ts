import { blogCollection } from "../../db/mongo.db";
import { mapToBlogListOutput } from "../application/mappers/map-to-blog-list-output.util";
import { BlogListPaginatedOutput } from "../application/output/blog-list-paginated-type.output";
import { BlogsListRequestPayload } from "../routes/request-payloads/blogs-list.request-payload";

export class BlogQueryRepository {
  async findAllBlogsQueryRepo(
    queryDto: BlogsListRequestPayload
  ): Promise<BlogListPaginatedOutput> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;

    const filter = {
      // * встроенные операторы mongodb $regex и $options, 'i' - для игнорирования регистра
      $or: [
        {
          name: { $regex: searchNameTerm ?? "", $options: "i" },
        },
      ],
    };

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
}
