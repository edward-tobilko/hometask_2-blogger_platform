import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostOrmEntity } from './post-orm.entity';
import { UserAccountOrmEntity } from 'src/modules/user-accounts/infrastructure/sql/schemas/user-orm.entity';

@Unique(['postId', 'userId'])
@Entity('post_likes')
export class PostLikeOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string; // PK

  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string; // FK - чтобы найти лайки конкретного поста

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  status!: LikeStatus; // dto - фильтруем: только 'Like'

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string; // FK + userName - нужен в ответе для "newestLikes" (3 последних лайка)

  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt!: Date; // нужен в ответе для "newestLikes" (3 последних лайка)

  // * Joins
  @ManyToOne(() => PostOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' }) // TypeORM знает, что post_id — FK на posts.id
  post!: PostOrmEntity;

  @ManyToOne(() => UserAccountOrmEntity)
  @JoinColumn({ name: 'user_id' }) // TypeORM знает, что user_id — FK на user_accounts.id
  user!: UserAccountOrmEntity; // нужен для JOIN чтобы вытащить login пользователя в newestLikes
}
