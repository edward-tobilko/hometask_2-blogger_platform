import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('posts')
export class PostOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string; // PK

  @Column({ type: 'varchar' })
  title!: string; // dto

  @Column({ name: 'short_description', type: 'varchar' })
  shortDescription!: string; // dto

  @Column({ type: 'varchar' })
  content!: string; // dto

  @Column({ name: 'blog_id', type: 'uuid' })
  blogId!: string; // FK + blog name

  @Column({ name: 'blog_name', type: 'varchar' })
  blogName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount!: number; // денормализованный счётчик, обновляются при каждом лайке

  @Column({ name: 'dislikes_count', type: 'int', default: 0 })
  dislikesCount!: number; // денормализованный счётчик, обновляются при каждом лайке
}
