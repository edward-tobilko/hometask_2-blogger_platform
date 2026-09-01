import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentOrmEntity } from '../schemas/comment-orm.entity';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,
  ) {}

  async findById(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const commentInstance = await this.commentRepo.findOne({
      where: {
        id,
        isBanned: false, // забаненные комментарии не будут попадать ни в items, ни в totalCount
      },
    });

    if (!commentInstance) return null;

    // * Получаем динамический статус
    // const myStatus = userId
    //   ? (commentInstance.likesInfo.userReactions.find(
    //       (reaction) => reaction.userId === userId,
    //     )?.status ?? LikeStatus.None)
    //   : LikeStatus.None;

    return CommentViewModel.mapToViewModel(commentInstance, LikeStatus.None);
  }
}
