import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentLean } from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';

class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

class LikesInfo {
  likesCount!: number;
  dislikesCount!: number;
  myStatus!: LikeStatus;
}

export class CommentViewModel {
  id!: string;
  content!: string;

  commentatorInfo!: CommentatorInfo;

  createdAt!: string;

  likesInfo!: LikesInfo;

  static mapToViewModel(
    this: void, // не реальный параметр функции, просто аннотация для TypeScript / ESLint что бы не ругался
    commentDocument: CommentLean,
    // myStatus: LikeStatus,
  ): CommentViewModel {
    const dto = new CommentViewModel();

    dto.id = commentDocument._id.toString();
    dto.content = commentDocument.content;

    dto.commentatorInfo = {
      userId: commentDocument.commentatorInfo.userId.toString(),
      userLogin: commentDocument.commentatorInfo.userLogin,
    };

    dto.createdAt = commentDocument.createdAt.toISOString();

    dto.likesInfo = {
      likesCount: commentDocument.likesInfo.likesCount,
      dislikesCount: commentDocument.likesInfo.dislikesCount,
      myStatus: LikeStatus.None,
      //   myStatus, // динамический статус
    };

    return dto;
  }
}
