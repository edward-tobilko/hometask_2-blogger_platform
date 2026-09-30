import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

import { CreatePostDomainDto } from '../../../domain/dto/create-post.domain-dto';
import { UpdatePostDomainDto } from '../../../domain/dto/update-post.domain-dto';

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

  @Column({ name: 'blog_name', type: 'varchar', nullable: true })
  blogName!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount!: number; // денормализованный счётчик, обновляются при каждом лайке

  @Column({ name: 'dislikes_count', type: 'int', default: 0 })
  dislikesCount!: number; // денормализация

  static create(dto: CreatePostDomainDto, blogName: string): PostOrmEntity {
    const postInstance = new PostOrmEntity();

    postInstance.title = dto.title;
    postInstance.shortDescription = dto.shortDescription;
    postInstance.content = dto.content;
    postInstance.blogId = dto.blogId;

    postInstance.blogName = blogName;

    return postInstance;
  }

  update(dto: UpdatePostDomainDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}
