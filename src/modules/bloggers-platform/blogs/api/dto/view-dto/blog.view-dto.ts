import { ApiProperty } from '@nestjs/swagger';

import { BlogDocument, BlogLean } from '../../../domain/entities/blog.entity';

export class BlogViewModel {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  websiteUrl!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({
    description: 'True if user has not expired membership subscription to blog',
  })
  isMembership!: boolean;

  static mapToViewModel(blog: BlogDocument | BlogLean): BlogViewModel {
    const dto = new BlogViewModel();

    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;

    return dto;
  }
}
