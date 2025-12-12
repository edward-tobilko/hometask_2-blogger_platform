import { WithId } from "mongodb";

import { BlogDomain } from "../../domain/blog.domain";
import { BlogOutput } from "../output/blog-type.output";

export const mapToBlogOutput = (blogDb: WithId<BlogDomain>): BlogOutput => {
  return {
    id: blogDb._id.toString(),
    name: blogDb.name,
    description: blogDb.description,
    websiteUrl: blogDb.websiteUrl,
    createdAt:
      blogDb.createdAt instanceof Date
        ? blogDb.createdAt.toISOString()
        : blogDb.createdAt,
    isMembership: blogDb.isMembership,
  };
};

// ? MongoDB создает поле _id (типа ObjectId), которое фронтенду лучше видеть как id: string.

// ? Эта функция:
// ? - конвертирует _id → id (в формате string),
// ? - фильтрует или реорганизует данные под нужный фронтенд-формат,
// ? - скрывает лишние внутренние поля (как __v, _id, passwordHash и т.п.).

// ? Это best practice: всегда делать mapper (DTO/ViewModel) между базовыми моделями и теми, которые возвращаются клиенту.
