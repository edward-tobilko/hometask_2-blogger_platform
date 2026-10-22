import { Column, Entity, Index } from 'typeorm';

import { UpdateBlogDomainDto } from '../../../domain/dto/update-blog.domain-dto';
import { CreateBlogDomainDto } from '../../../domain/dto/create-blog.domain-dto';
import { BaseDBEntity } from 'src/core/base-entity/base-db.entity';

@Entity('blogs')
export class BlogOrmEntity extends BaseDBEntity {
  @Column({ type: 'varchar' })
  @Index('IDX_blogs_name_trgm', { synchronize: false })
  name!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ name: 'website_url', type: 'varchar' })
  websiteUrl!: string;

  @Column({ name: 'is_membership', type: Boolean, default: false })
  isMembership!: boolean;

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
