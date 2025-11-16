import { blogCollection } from "../../db/mongo.db";
import { BlogQueryParamInput } from "../types/blog.types";

export class BlogQueryRepository {
  async findAllBlogsQueryRepo(queryDto: BlogQueryParamInput): Promise<any> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;

    const filter = {
      $or: [
        {
          name: { $regex: searchNameTerm ?? "", $options: "i" },
        },
      ],
    };

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await blogCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogCollection.countDocuments(filter);

    return { items, totalCount };
  }
}

// ? встроенные операторы mongodb $or, $regex, $options, 'i' - для игнорирования регистра.
// ? "asc" (по возрастанию), то mongo используется 1.
// ? "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A.
// ? пропускаем определённое количество док. перед тем, как вернуть нужный набор данных: Например, страница 3, pageSize=10 → пропускает 20 документов.
