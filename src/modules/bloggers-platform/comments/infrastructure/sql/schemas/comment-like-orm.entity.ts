import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

import { LikeStatus } from 'src/core/enums/like-status.enum';
import { CommentOrmEntity } from './comment-orm.entity';

@Unique(['commentId', 'userId'])
@Entity('comment_likes')
export class CommentLikeOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ name: 'comment_id', type: 'uuid' })
  commentId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  status!: LikeStatus;

  @Column({ name: 'user_name', type: 'varchar', nullable: true })
  userName!: string | null;

  @ManyToOne(() => CommentOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment!: CommentOrmEntity;
}
