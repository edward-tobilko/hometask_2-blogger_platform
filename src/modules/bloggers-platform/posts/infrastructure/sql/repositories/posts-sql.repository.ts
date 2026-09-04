import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { CreatePostDomainDto } from '../../../domain/dto/create-post.domain-dto';
import { PostLikeOrmEntity } from '../schemas/post-like-orm.entity';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsRepo: Repository<PostOrmEntity>,

    @InjectRepository(PostLikeOrmEntity)
    private readonly postLikesRepo: Repository<PostLikeOrmEntity>,
  ) {}

  async findById(id: string): Promise<PostOrmEntity | null> {
    return this.postsRepo.findOne({ where: { id } });
  }

  async save(post: PostOrmEntity): Promise<PostOrmEntity> {
    return this.postsRepo.save(post);
  }

  async create(dto: CreatePostDomainDto, name: string): Promise<PostOrmEntity> {
    const postInstance = this.postsRepo.create({
      ...dto,

      blogName: name, // + опциональное поле с блога
    });

    return this.save(postInstance);
  }

  async delete(id: string): Promise<void> {
    await this.postsRepo.delete(id);
  }

  async setLikeStatusForPost(
    postId: string,
    userId: string,
    likes: number,
    dislikes: number,
    likeStatus: LikeStatus,
  ): Promise<void> {
    // * INSERT + UPDATE в бд для нового статуса
    await this.postLikesRepo.upsert(
      { postId, userId, status: likeStatus },
      {
        conflictPaths: ['postId', 'userId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    // * Обновляем likes_count / dislikes_count на посте
    await this.postsRepo
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => 'likes_count + :likes',
        dislikesCount: () => 'dislikes_count + :dislikes',
      })
      .where('id = :postId', { postId, likes, dislikes })
      .execute();
  }
}
