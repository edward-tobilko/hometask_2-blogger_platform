import { ApiProperty } from '@nestjs/swagger';

import { BlogLean } from '../../../domain/entities/blog.entity';
import { SubscriptionStatus } from 'src/core/enums/subscription-status.enum';

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

  static mapToViewModel(
    blog: BlogLean,
    subscribersCount: number,
    currentUserSubscriptionStatus: SubscriptionStatus,
  ): BlogViewModel {
    const dto = new BlogViewModel();

    dto.id = blog._id.toString();
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

// ? subscribersCount / currentUserSubscriptionStatus - это не свойства блога. Это вычисляемые данные которые зависят от другой коллекции (blog-subscriptions) и от конкретного пользователя который делает запрос. В БД их нет, они рассчитываются на лету в aggregation pipeline. Простое правило: если поле хранится в БД → оно в Entity. Если поле вычисляется для ответа клиенту → только в ViewModel.
