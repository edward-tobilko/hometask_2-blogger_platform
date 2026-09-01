import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentOrmEntity } from '../schemas/comment-orm.entity';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,
  ) {}

  async findById(commentId: string): Promise<CommentOrmEntity | null> {
    return this.commentRepo.findOneBy({ id: commentId });
  }

  async findUserCurrentLikeStatus(
    userId: string,
    commentId: string,
  ): Promise<LikeStatus | null> {
    const commentInstance = await this.findById(commentId);

    const userLikeStatus = userId ? commentInstance!.status : LikeStatus.None;

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
    // * Удалить старую реакцию и обновить счётчики
    await this.commentRepo.update(
      { id: commentId },
      { likesCount: likes, dislikesCount: disLikes },
    );

    // * Добавить новую реакцию (только если статус не "None")
    if (likeStatus !== LikeStatus.None) {
      await this.commentRepo.update({ id: commentId }, { status: likeStatus });
    }
  }

  async delete(commentId: string): Promise<void> {
    await this.commentRepo.delete(commentId);
  }
}
