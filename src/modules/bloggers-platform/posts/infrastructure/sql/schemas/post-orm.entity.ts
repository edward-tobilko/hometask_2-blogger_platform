import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('posts')
export class PostOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ name: 'short_description', type: 'varchar' })
  shortDescription!: string;

  @Column({ type: 'varchar' })
  content!: string;

  @Column({ name: 'blog_id', type: 'uuid' })
  blogId!: string;

  @Column({ name: 'blog_name', type: 'varchar' })
  blogName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  //   // * Поля которые должны быть связаны (JOIN) с posts таблицей
  //   @Column({ name: 'likes_count', type: 'int', default: 0 })
  //   likesCount!: number;

  //   @Column({ name: 'dislikes_count', type: 'int', default: 0 })
  //   dislikesCount!: number;

  //   @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  //   addedAt!: Date;

  //   @Column({ type: 'uuid' })
  //   userId!: string;

  //   @Column({ type: 'varchar' })
  //   login!: string;

  //   // * поле для хранения всех реакций пользователей
  //   @Column({
  //     type: [{ userId: String, login: String, status: String, addedAt: Date }],
  //     default: [],
  //   })
  //   userReactions!: {
  //     userId: string;
  //     login: string;
  //     status: LikeStatus;
  //     addedAt: Date;
  //   }[];
}
