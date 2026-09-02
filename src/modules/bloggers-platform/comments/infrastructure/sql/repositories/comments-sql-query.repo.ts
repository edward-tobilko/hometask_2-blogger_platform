import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentOrmEntity } from '../schemas/comment-orm.entity';
import { CommentLikeOrmEntity } from '../schemas/comment-like-orm.entity';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,

    @InjectRepository(CommentLikeOrmEntity)
    private readonly commentLikeRepo: Repository<CommentLikeOrmEntity>,
  ) {}

  async findById(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    // * Находим коммент юзера
    const commentInstance = await this.commentRepo.findOne({
      where: {
        id,
        isBanned: false, // забаненные комментарии не будут попадать ни в items, ни в totalCount
      },
    });

    if (!commentInstance) return null;

    // * Получаем его лайк
    const like = userId
      ? await this.commentLikeRepo.findOneBy({
          commentId: id,
          userId, // userId может быть undefined (неавторизованный пользователь) -> нужна проверка на null
        })
      : null;

    // * Получаем динамический статус
    const myStatus = like?.status ?? LikeStatus.None;

    return CommentViewModel.mapToViewModel(commentInstance, myStatus);
  }
}
