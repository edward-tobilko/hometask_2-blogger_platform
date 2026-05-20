import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentLean } from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';

class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

class LikesInfo {
  likesCount!: number;
  dislikesCount!: number;
  myStatus?: LikeStatus;
}

export class CommentViewModel {
  id!: string;
  content!: string;

  commentatorInfo!: CommentatorInfo;

  createdAt!: string;

  likesInfo?: LikesInfo;

  static mapToViewModel(
    commentDocument: CommentLean,
    myStatus: LikeStatus = LikeStatus.None,
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
      likesCount: commentDocument.likesInfo.likesCount ?? 0,
      dislikesCount: commentDocument.likesInfo.dislikesCount ?? 0,
      myStatus, // динамический статус
    };

    return dto;
  }
}
