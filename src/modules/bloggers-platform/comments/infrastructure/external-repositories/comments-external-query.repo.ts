import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { QueryDto } from 'src/core/dto/query.dto';
import { CommentsPaginatedViewModel } from '../../api/dto/view-dto/comments-paginated.view-dto';
import { CommentOrmEntity } from '../sql/schemas/comment-orm.entity';
import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentViewModel } from '../../api/dto/view-dto/comment.view-dto';
import { CommentLikeOrmEntity } from '../sql/schemas/comment-like-orm.entity';

@Injectable()
export class CommentsExternalQueryRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,

    @InjectRepository(CommentLikeOrmEntity)
    private readonly commentLikeRepo: Repository<CommentLikeOrmEntity>,
  ) {}

  async findByPostId(
    postId: string,
    query: QueryDto,
    userId?: string,
  ): Promise<CommentsPaginatedViewModel> {
    const [items, totalCount] = await this.commentRepo.findAndCount({
      where: { postId },
      order: query.calculateSort(),
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const likesMap = new Map<string, LikeStatus>();

    if (userId && items.length > 0) {
      const commentIds = items.map((comment) => comment.id);

      const userLikes = await this.commentLikeRepo.findBy({
        commentId: In(commentIds),
        userId,
      });

      for (const userLike of userLikes) {
        likesMap.set(userLike.commentId, userLike.status);
      }
    }

    return CommentsPaginatedViewModel.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,

      items: items.map((postComment) => {
        const myStatus = likesMap.get(postComment.id) ?? LikeStatus.None;

        return CommentViewModel.mapToViewModel(postComment, myStatus);
      }),
    });
  }
}
