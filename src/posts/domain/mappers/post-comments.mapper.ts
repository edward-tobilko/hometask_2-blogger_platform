import { PostCommentsListPaginatedOutput } from "posts/application/output/post-comments-list-type.output";
import { PostCommentEntity } from "../entities/post-comment.entity";
import { IPostCommentOutput } from "posts/application/output/post-comment.output";
import { LikeStatus } from "@core/types/like-status.enum";
import { PostCommentsLean } from "posts/infrastructure/schemas/post-comments.schema";

export class PostCommentsMapper {
  // * DB -> Domain
  static toDomain(doc: PostCommentsLean): PostCommentEntity {
    return PostCommentEntity.reconstitute({
      id: doc._id.toString(),
      content: doc.content,
      postId: doc.postId.toString(),

      commentatorInfo: {
        userId: doc.commentatorInfo.userId.toString(),
        userLogin: doc.commentatorInfo.userLogin,
      },

      createdAt: doc.createdAt,

      likesInfo: {
        likesCount: doc.likesInfo.likesCount,
        dislikesCount: doc.likesInfo.dislikesCount,
      },
    });
  }

  // * Domain -> Output
  static toViewModel(
    entity: PostCommentEntity,
    myStatus: LikeStatus
  ): IPostCommentOutput {
    return {
      id: entity.id.toString(),
      content: entity.content,

      commentatorInfo: {
        userId: entity.commentatorInfo.userId.toString(),
        userLogin: entity.commentatorInfo.userLogin,
      },

      likesInfo: {
        likesCount: entity.likesInfo.likesCount,
        dislikesCount: entity.likesInfo.dislikesCount,
        myStatus,
      },

      createdAt: entity.createdAt.toISOString(),
    };
  }

  // * Domain -> List Output
  static toListViewModel(
    postCommentsDomain: PostCommentEntity[],
    userLikes: Map<string, LikeStatus>,
    meta: { page: number; pageSize: number; totalCount: number }
  ): PostCommentsListPaginatedOutput {
    return {
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      page: meta.page,
      pageSize: meta.pageSize,
      totalCount: meta.totalCount,

      items: postCommentsDomain.map((postComment) => {
        const myStatus = userLikes.get(postComment.id) ?? LikeStatus.None;

        return PostCommentsMapper.toViewModel(postComment, myStatus);
      }),
    };
  }
}
