import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { PostOrmEntity } from './post-orm.entity';

@Unique('UQ_post_likes_post_id_user_id', ['postId', 'userId']) // UQ constraint -> под капотом составной уникальный индекс (post_id, user_id);
@Index('IDX_post_likes_post_id_added_at_like', ['postId', 'addedAt'], {
  where: `"status" = '${LikeStatus.Like}'`,
})
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

  // * JOINS
  @ManyToOne(() => PostOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'FK_post_likes_post_id',
  })
  post!: PostOrmEntity;
}
