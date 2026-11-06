import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CreatePostDomainDto } from '../../../domain/dto/create-post.domain-dto';
import { UpdatePostDomainDto } from '../../../domain/dto/update-post.domain-dto';
import { BlogOrmEntity } from 'src/modules/bloggers-platform/blogs/infrastructure/sql/schemas/blog-orm.entity';

@Entity('posts')
@Index('IDX_posts_blog_id_created_at', ['blogId', 'createdAt'])
export class PostOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // PK

  @Column({ type: 'varchar' })
  title!: string; // dto

  @Column({ name: 'short_description', type: 'varchar' })
  shortDescription!: string; // dto

  @Column({ type: 'varchar' })
  content!: string; // dto

  @Column({ name: 'blog_id', type: 'uuid' })
  blogId!: string; // FK + blog name

  @Column({ name: 'blog_name', type: 'varchar', nullable: true })
  blogName!: string | null;

  @Index('IDX_posts_created_at')
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount!: number; // денормализованный счётчик, обновляются при каждом лайке

  @Column({ name: 'dislikes_count', type: 'int', default: 0 })
  dislikesCount!: number; // денормализация

  // * JOINS
  @ManyToOne(() => BlogOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_id', foreignKeyConstraintName: 'FK_posts_blog_id' })
  blog!: BlogOrmEntity;

  static create(dto: CreatePostDomainDto): PostOrmEntity {
    const postInstance = new PostOrmEntity();

    postInstance.title = dto.title;
    postInstance.shortDescription = dto.shortDescription;
    postInstance.content = dto.content;
    postInstance.blogId = dto.blogId;

    return postInstance;
  }

  update(dto: UpdatePostDomainDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}
