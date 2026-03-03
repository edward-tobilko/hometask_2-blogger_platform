import {
  PostDb,
  PostDocument,
} from "posts/infrastructure/mongoose/post.schema";
import { PostEntity } from "../entities/post.entity";
import { Types } from "mongoose";

export class PostMapper {
  static toDomain(doc: PostDocument): PostEntity {
    return PostEntity.reconstitute({
      id: doc._id.toString(),
      title: doc.title,
      shortDescription: doc.shortDescription,
      content: doc.content,
      blogId: doc.blogId.toString(),
      blogName: doc.blogName,

      createdAt: doc.createdAt,
    });
  }

  static toDb(entity: PostEntity): PostDb & { _id?: Types.ObjectId } {
    return {
      _id: entity.id ? new Types.ObjectId(entity.id) : undefined,
      title: entity.title,
      shortDescription: entity.shortDescription,
      content: entity.content,
      blogId: new Types.ObjectId(entity.blogId),
      blogName: entity.blogName,
      createdAt: entity.createdAt,
    };
  }
}

// ? domain <-> database
