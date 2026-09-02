import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentOrmEntity } from '../schemas/comment-orm.entity';
import { CommentLikeOrmEntity } from '../schemas/comment-like-orm.entity';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,

    @InjectRepository(CommentLikeOrmEntity)
    private readonly commentLikeRepo: Repository<CommentLikeOrmEntity>,
  ) {}

  async findById(commentId: string): Promise<CommentOrmEntity | null> {
    return this.commentRepo.findOneBy({ id: commentId });
  }

  async findUserCurrentLikeStatus(
    userId: string,
    commentId: string,
  ): Promise<LikeStatus | null> {
    const commentLikeInstance = await this.commentLikeRepo.findOneBy({
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
    const commentInstance = this.commentRepo.create({
      content,
      postId,
      userId,
      userLogin,
      likesCount: 0,
      dislikesCount: 0,
      status: LikeStatus.None,
    });

    return this.save(commentInstance);
  }

  async setLikeStatusForComment(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
    likes: number,
    disLikes: number,
  ): Promise<void> {
    await this.commentLikeRepo.upsert(
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

    await this.commentRepo
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
