import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Unique('UQ_blog_subscriptions_user_id_blog_id', ['userId', 'blogId'])
@Entity('blog_subscriptions')
export class BlogSubscriptionsOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // PK

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string; // FK - кто подписываеться

  @Column({ name: 'blog_id', type: 'uuid' })
  blogId!: string; // FK - на что подписываемся

  @CreateDateColumn({ name: 'subscribe_at', type: 'timestamptz' })
  subscribedAt!: Date; // когда подписался
}
