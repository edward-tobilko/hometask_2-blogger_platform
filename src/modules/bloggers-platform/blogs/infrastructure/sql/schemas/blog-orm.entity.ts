import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UpdateBlogDomainDto } from '../../../domain/dto/update-blog.domain-dto';
import { CreateBlogDomainDto } from '../../../domain/dto/create-blog.domain-dto';

@Entity('blogs')
export class BlogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ name: 'website_url', type: 'varchar' })
  websiteUrl!: string;

  @Column({ name: 'is_membership', type: Boolean, default: false })
  isMembership!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  static create(dto: CreateBlogDomainDto): BlogOrmEntity {
    const blogInstance = new BlogOrmEntity();

    blogInstance.name = dto.name;
    blogInstance.description = dto.description;
    blogInstance.websiteUrl = dto.websiteUrl;

    return blogInstance;
  }

  update(dto: UpdateBlogDomainDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
