import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/api/dto/view-dto/comment.view-dto';
import { CommentOrmEntity } from '../schemas/comment-orm.entity';
import { CommentLikeOrmEntity } from '../schemas/comment-like-orm.entity';

interface CommentRaw {
  c_id: string;
  c_post_id: string;
  c_content: string;
  c_created_at: Date;
  c_user_id: string;
  c_user_login: string;
  c_likes_count: number;
  c_dislikes_count: number;
  c_is_banned: boolean;

  cl_status: LikeStatus | null;
}

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

  static mapRawToViewModel(commentRaw: CommentRaw): CommentViewModel {
    const dto = new CommentViewModel();

    dto.id = commentRaw.c_id;
    dto.content = commentRaw.c_content;

    dto.commentatorInfo = {
      userId: commentRaw.c_user_id,
      userLogin: commentRaw.c_user_login,
    };

    dto.createdAt = commentRaw.c_created_at;

    dto.likesInfo = {
      likesCount: commentRaw.c_likes_count ?? 0,
      dislikesCount: commentRaw.c_dislikes_count ?? 0,
      myStatus: commentRaw.cl_status ?? LikeStatus.None,
    };

    return dto;
  }

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

  async findByIdCTE(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    // * Тело CTE (внутренний запрос)
    const commentCTEBuilder = this.commentRepo
      .createQueryBuilder('c')
      .select([
        'c.id',
        'c.postId',
        'c.content',
        'c.createdAt',
        'c.userId',
        'c.userLogin',
        'c.likesCount',
        'c.dislikesCount',
        'c.isBanned',
      ])
      .addSelect(['cl.status'])
      .leftJoin(
        'comment_likes',
        'cl',
        'cl.comment_id = c.id AND cl.user_id = :userId', // связь таблиц по условию (ON cl.comment_id = c.id) и (AND) след. условие нужно если лайка нет, строка комментария всё равно вернётся, просто cl.status будет NULL;
        { userId },
      )
      .where('c.id = :id', { id }) // фильтр по конкретному комментарию, который запрашивается. Без него вернулись бы все комментарии;
      .andWhere('c.is_banned = false');

    // * Оборачиваем в CTE и делаем внешний SELECT
    const commentRaw = await this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(commentCTEBuilder, 'comment_with_status')
      .from('comment_with_status', 'cws')
      .getRawOne<CommentRaw>();

    if (!commentRaw) return null;

    return CommentsSqlQueryRepository.mapRawToViewModel(commentRaw);
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
