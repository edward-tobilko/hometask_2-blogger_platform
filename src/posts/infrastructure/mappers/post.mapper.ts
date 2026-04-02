import { Types } from "mongoose";

import { PostDb, PostLean } from "@posts/infrastructure/schemas/post.schema";
import { PostOutput } from "@posts/application/output/post-type.output";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostsListPaginatedOutput } from "@posts/application/output/posts-list-type.output";
import { PostEntity } from "@posts/domain/entities/post.entity";

export class PostMapper {
  // * DB -> Domain
  static toDomain(doc: PostLean): PostEntity {
    return PostEntity.reconstitute({
      id: doc._id.toString(),

      title: doc.title,
      shortDescription: doc.shortDescription,
      content: doc.content,
      blogId: doc.blogId.toString(),

      blogName: doc.blogName,
      createdAt: doc.createdAt,

      extendedLikesInfo: {
        likesCount: doc.extendedLikesInfo?.likesCount ?? 0,
        dislikesCount: doc.extendedLikesInfo?.dislikesCount ?? 0,

        // * берем из mongo
        newestLikes: (doc.extendedLikesInfo?.newestLikes ?? []).map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId.toString(),
          login: like.login,
        })),
      },
    });
  }

  // * Domain -> DB
  static toDb(entity: PostEntity): PostDb {
    return {
      title: entity.title,
      shortDescription: entity.shortDescription,
      content: entity.content,
      blogId: new Types.ObjectId(entity.blogId),

      blogName: entity.blogName,
      createdAt: entity.createdAt,

      // * берем из entity
      extendedLikesInfo: {
        likesCount: entity.extendedLikesInfo.likesCount,
        dislikesCount: entity.extendedLikesInfo.dislikesCount,

        newestLikes: entity.extendedLikesInfo.newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })),
      },
    };
  }

  // * Domain -> Output
  static toViewModel(entity: PostEntity, myStatus: LikeStatus): PostOutput {
    return {
      id: entity.id.toString(),
      title: entity.title,
      shortDescription: entity.shortDescription,
      content: entity.content,
      blogId: entity.blogId.toString(),

      blogName: entity.blogName,
      createdAt: entity.createdAt.toISOString(), // отдаем ту дату, которая в entity

      extendedLikesInfo: {
        likesCount: entity.extendedLikesInfo.likesCount,
        dislikesCount: entity.extendedLikesInfo.dislikesCount,
        myStatus,

        newestLikes: entity.extendedLikesInfo.newestLikes.map((like) => ({
          addedAt: like.addedAt.toISOString(),
          userId: like.userId.toString(),
          login: like.login,
        })),
      },
    };
  }

  // * Domain -> List Output
  static toListViewModel(
    entities: PostEntity[],
    userLikes: Map<string, LikeStatus>,
    meta: { page: number; pageSize: number; totalCount: number }
  ): PostsListPaginatedOutput {
    return {
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      page: meta.page,
      pageSize: meta.pageSize,
      totalCount: meta.totalCount,

      items: entities.map((entity) => {
        const myStatus = userLikes.get(entity.id) ?? LikeStatus.None;

        return PostMapper.toViewModel(entity, myStatus);
      }),
    };
  }
}
