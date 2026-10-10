import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentOrmEntity } from '../sql/schemas/comment-orm.entity';

@Injectable()
export class CommentsExternalRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepo: Repository<CommentOrmEntity>,
  ) {}

  async hideAllByUserId(userId: string): Promise<void> {
    await this.commentRepo.update(
      { userId }, // фильтр — все комменты этого юзера
      { isBanned: true }, // обновление — ставим флаг
    );
  }

  async showAllByUserId(userId: string): Promise<void> {
    await this.commentRepo.update({ userId }, { isBanned: false });
  }
}
