import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

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

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByIdRaw(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const result = await this.dataSource.query<
      (CommentOrmEntity & { status: LikeStatus })[]
    >(
      `SELECT c.id,
        c."content",
        c.user_id AS "userId",
        c.user_login AS "userLogin",
        c.created_at AS "createdAt",
        c.likes_count as "likesCount",
        c.dislikes_count as "dislikeCount",
        cl.status FROM PUBLIC."comments" c
      LEFT JOIN PUBLIC.comment_likes cl ON cl.comment_id = c.id AND cl.user_id = $2
      WHERE c.id = $1 AND c.is_banned = false`,
      [id, userId ?? null], // $1 = id комментария, $2 = id текущего юзера
    );

    if (!result[0]) return null;

    return CommentViewModel.mapToViewModel(
      result[0],
      result[0].status ?? LikeStatus.None,
    );
  }

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
