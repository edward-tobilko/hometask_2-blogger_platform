import { BlogDb, BlogLean } from "blogs/infrastructure/schemas/blog.schema";
import { BlogEntity } from "../entities/blog.entity";
import { BlogOutput } from "blogs/application/output/blog-type.output";

export class BlogMapper {
  // * Domain to Db
  static toDb(blogEntity: BlogEntity): BlogDb {
    return {
      name: blogEntity.name,
      description: blogEntity.description,
      websiteUrl: blogEntity.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
  }

  // * Db to Domain
  static toDomain(blogDoc: BlogLean): BlogEntity {
    return BlogEntity.reconstitute({
      id: blogDoc._id.toString(),
      name: blogDoc.name,
      description: blogDoc.description,
      websiteUrl: blogDoc.websiteUrl,
      createdAt: blogDoc.createdAt,
      isMembership: blogDoc.isMembership,
    });
  }

  // * Domain to Output
  static toViewModel(blog: BlogEntity | BlogLean): BlogOutput {
    if (blog instanceof BlogEntity) {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt.toISOString(),
        isMembership: blog.isMembership,
      };
    }

    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}

// ? MongoDB создает поле _id (типа ObjectId), которое фронтенду лучше видеть как id: string.

// ? Эта функция:
// ? - конвертирует _id → id (в формате string),
// ? - фильтрует или реорганизует данные под нужный фронтенд-формат,
// ? - скрывает лишние внутренние поля (как __v, _id, passwordHash и т.п.).

// ? Это best practice: всегда делать mapper (DTO/ViewModel) между базовыми моделями и теми, которые возвращаются клиенту.
