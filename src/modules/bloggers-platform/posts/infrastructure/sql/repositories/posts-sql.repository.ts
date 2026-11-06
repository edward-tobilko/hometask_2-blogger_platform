import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostOrmEntity } from '../schemas/post-orm.entity';
import { CreatePostDomainDto } from '../../../domain/dto/create-post.domain-dto';
import { PostLikeOrmEntity } from '../schemas/post-like-orm.entity';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postsRepo: Repository<PostOrmEntity>,
  ) {}

  async findById(id: string): Promise<PostOrmEntity | null> {
    return this.postsRepo.findOne({ where: { id } });
  }

  async save(post: PostOrmEntity): Promise<PostOrmEntity> {
    return this.postsRepo.save(post);
  }

  async create(dto: CreatePostDomainDto): Promise<PostOrmEntity> {
    const postInstance = PostOrmEntity.create(dto);

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
    manager: EntityManager,
  ): Promise<void> {
    // * TRANSACTION (manager) - это и есть ключевой момент. this.postsRepo берёт свободное соединение из пула, а транзакция и блокировка живут на соединении, которое держит manager. Запрос через this.* ушёл бы мимо транзакции: его бы не откатили, и он бы не ждал блокировки.
    await manager.getRepository(PostLikeOrmEntity).upsert(
      { postId, userId, status: likeStatus },
      {
        conflictPaths: ['postId', 'userId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    // * Обновляем likes_count / dislikes_count на посте
    await manager
      .getRepository(PostOrmEntity)
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => 'likes_count + :likes',
        dislikesCount: () => 'dislikes_count + :dislikes',
      })
      .where('id = :postId', { postId, likes, dislikes })
      .execute();
  }

  async findUserCurrentLikeStatus(
    postId: string,
    userId: string,
    manager: EntityManager,
  ): Promise<LikeStatus | null> {
    const postInstance = await manager
      .getRepository(PostLikeOrmEntity)
      .findOne({
        where: { postId, userId },
      });

    return postInstance?.status ?? LikeStatus.None;
  }

  // * SELECT ... FOR UPDATE: блокирует строку поста до конца транзакции — параллельные изменения лайков этого поста встают в очередь;
  async findByIdForUpdate(
    id: string,
    manager: EntityManager,
  ): Promise<PostOrmEntity | null> {
    return manager
      .getRepository(PostOrmEntity)
      .createQueryBuilder('p')
      .setLock('pessimistic_write') // -> FOR UPDATE
      .where('p.id = :id', { id })
      .getOne();
  }
}
