import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';

@Unique('UQ_post_likes_post_id_user_id', ['postId', 'userId']) // UQ
@Entity('post_likes')
export class PostLikeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // PK

  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string; // FK - чтобы найти лайки конкретного поста

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  status!: LikeStatus; // dto - фильтруем: только 'Like'

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string; // FK + userName - нужен в ответе для "newestLikes" (3 последних лайка)

  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt!: Date; // нужен в ответе для "newestLikes" (3 последних лайка)
}
