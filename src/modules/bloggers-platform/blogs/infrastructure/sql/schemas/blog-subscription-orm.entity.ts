import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

import { UserAccountOrmEntity } from 'src/modules/user-accounts/infrastructure/sql/schemas/user-orm.entity';
import { BlogOrmEntity } from './blog-orm.entity';

@Unique('UQ_blog_subscriptions_user_id_blog_id', ['userId', 'blogId'])
@Entity('blog_subscriptions')
export class BlogSubscriptionsOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string; // PK

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string; // FK - кто подписываеться

  @Column({ name: 'blog_id', type: 'uuid' })
  blogId!: string; // FK - на что подписываемся

  @CreateDateColumn({ name: 'subscribe_at', type: 'timestamptz' })
  subscribedAt!: Date; // когда подписался

  // * Joins
  @ManyToOne(() => UserAccountOrmEntity, { onDelete: 'CASCADE' })
  user!: UserAccountOrmEntity;

  @ManyToOne(() => BlogOrmEntity, { onDelete: 'CASCADE' })
  blog!: BlogOrmEntity;
}
