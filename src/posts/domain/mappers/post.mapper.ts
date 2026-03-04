import { Types } from "mongoose";

import { PostDb, PostDocument } from "posts/infrastructure/schemas/post.schema";
import { PostEntity } from "../entities/post.entity";
import { LikeStatus } from "@core/types/like-status.enum";

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

      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            addedAt: new Date(),
            userId: "userId",
            login: "login",
          },
        ],
      },
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

      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        // myStatus: LikeStatus.None,
        newestLikes: [
          {
            addedAt: new Date(),
            userId: "userId",
            login: "login",
          },
        ],
      },
    };
  }
}

// ? domain <-> database
