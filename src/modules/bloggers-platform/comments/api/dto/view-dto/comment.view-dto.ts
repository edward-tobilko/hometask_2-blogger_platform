import { ApiProperty } from '@nestjs/swagger';

import { LikeStatus } from 'src/core/enums/like-status.enum';

interface CommentViewFields {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
}

class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

class LikesInfo {
  @ApiProperty({ description: 'Total likes for parent item' })
  likesCount!: number;

  @ApiProperty({ description: 'Total dislikes for parent item' })
  dislikesCount!: number;

  @ApiProperty({ description: 'Send None if you want to unlike/undislike' })
  myStatus?: LikeStatus;
}

export class CommentViewModel {
  id!: string;
  content!: string;

  commentatorInfo!: CommentatorInfo;

  createdAt!: Date;

  likesInfo?: LikesInfo;

  static mapToViewModel(
    comment: CommentViewFields,
    myStatus: LikeStatus = LikeStatus.None,
  ): CommentViewModel {
    const dto = new CommentViewModel();

    dto.id = comment.id;
    dto.content = comment.content;

    dto.commentatorInfo = {
      userId: comment.userId,
      userLogin: comment.userLogin,
    };

    dto.createdAt = comment.createdAt;

    dto.likesInfo = {
      likesCount: comment.likesCount ?? 0,
      dislikesCount: comment.dislikesCount ?? 0,
      myStatus, // динамический статус
    };

    return dto;
  }
}
