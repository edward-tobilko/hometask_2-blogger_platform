import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentOrmEntity } from '../schemas/comment-orm.entity';
import { CommentLikeOrmEntity } from '../schemas/comment-like-orm.entity';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,
  ) {}

  async findById(commentId: string): Promise<CommentOrmEntity | null> {
    return this.commentRepo.findOneBy({ id: commentId });
  }

  async findByIdForUpdate(
    commentId: string,
    manager: EntityManager,
  ): Promise<CommentOrmEntity | null> {
    return manager.getRepository(CommentOrmEntity).findOne({
      where: { id: commentId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async findUserCurrentLikeStatus(
    userId: string,
    commentId: string,
    manager: EntityManager,
  ): Promise<LikeStatus | null> {
    const commentLikeInstance = await manager
      .getRepository(CommentLikeOrmEntity)
      .findOneBy({
        commentId,
        userId,
      });

    const userLikeStatus = commentLikeInstance?.status ?? LikeStatus.None;

    return userLikeStatus;
  }

  async save(commentInstance: CommentOrmEntity): Promise<CommentOrmEntity> {
    return this.commentRepo.save(commentInstance);
  }

  async create(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentOrmEntity> {
    const commentInstance = CommentOrmEntity.create(
      postId,
      content,
      userId,
      userLogin,
    );

    return this.save(commentInstance);
  }

  async setLikeStatusForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
    likes: number,
    disLikes: number,
    manager: EntityManager,
  ): Promise<void> {
    await manager.getRepository(CommentLikeOrmEntity).upsert(
      {
        commentId,
        userId,
        status: likeStatus,
      },
      {
        conflictPaths: ['commentId', 'userId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await manager
      .getRepository(CommentOrmEntity)
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => 'likes_count + :likes',
        dislikesCount: () => 'dislikes_count + :disLikes',
      })
      .where('id = :commentId', { commentId, likes, disLikes })
      .execute();
  }

  async delete(commentId: string): Promise<void> {
    await this.commentRepo.delete(commentId);
  }
}
