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
      createdAt: new Date(),
      isMembership: false,
    });
  }

  // * Domain to Output
  static toViewModel(entity: BlogEntity): BlogOutput {
    return {
      id: entity.id.toString(),
      name: entity.name,
      description: entity.description,
      websiteUrl: entity.websiteUrl,
      createdAt: entity.createdAt.toISOString(),
      isMembership: entity.isMembership,
    };
  }
}
