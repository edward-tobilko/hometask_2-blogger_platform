import { ApiProperty } from '@nestjs/swagger';

import { BlogLean } from '../../../domain/entities/blog.entity';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';
import { BlogOrmEntity } from '../../../infrastructure/sql/schemas/blog-orm.entity';

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

  @ApiProperty({
    description: 'How many followers does the blog have ?',
  })
  subscribersCount!: number; // extra field over the basic API logic

  @ApiProperty()
  currentUserSubscriptionStatus!: SubscriptionStatus; // extra field over the basic API logic

  static mapToViewModel(blog: BlogOrmEntity | BlogLean): BlogViewModel {
    const dto = new BlogViewModel();

    dto.id =
      'id' in blog ? blog.id : (blog._id as unknown as string).toString(); // ! проверка пока у нас union types (blog: BlogOrmEntity | BlogLean)
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;

    return dto;
  }

  static extraLogicMapToViewModel(
    blog: BlogOrmEntity | BlogLean,
    subscribersCount: number,
    currentUserSubscriptionStatus: SubscriptionStatus,
  ) {
    const dto = new BlogViewModel();

    dto.id =
      'id' in blog ? blog.id : (blog._id as unknown as string).toString(); // ! проверка пока у нас union types (blog: BlogOrmEntity | BlogLean)
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;

    dto.subscribersCount = subscribersCount;
    dto.currentUserSubscriptionStatus = currentUserSubscriptionStatus;

    return dto;
  }
}
