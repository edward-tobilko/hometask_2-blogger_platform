import { ApiProperty } from '@nestjs/swagger';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentOrmEntity } from '../../../infrastructure/sql/schemas/comment-orm.entity';

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
    commentInstance: CommentOrmEntity,
    myStatus: LikeStatus = LikeStatus.None,
  ): CommentViewModel {
    const dto = new CommentViewModel();

    dto.id = commentInstance.id;
    dto.content = commentInstance.content;

    dto.commentatorInfo = {
      userId: commentInstance.userId,
      userLogin: commentInstance.userLogin,
    };

    dto.createdAt = commentInstance.createdAt;

    dto.likesInfo = {
      likesCount: commentInstance.likesCount ?? 0,
      dislikesCount: commentInstance.dislikesCount ?? 0,
      myStatus, // динамический статус
    };

    return dto;
  }
}
