import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CreateBlogSubscriptionDomainDto } from '../../../domain/dto/create-blog-subscription.domain-dto';
import { BlogSubscriptionsOrmEntity } from '../schemas/blog-subscription-orm.entity';

@Injectable()
export class BlogSubscriptionsRepository {
  constructor(
    @InjectRepository(BlogSubscriptionsOrmEntity)
    private blogSubscriptionRepo: Repository<BlogSubscriptionsOrmEntity>,
  ) {}

  async existsByUserAndBlog(userId: string, blogId: string): Promise<boolean> {
    const subscription = await this.blogSubscriptionRepo.findOne({
      where: { userId, blogId },
    });

    return !!subscription;
  }

  async createAndSave(
    dto: CreateBlogSubscriptionDomainDto,
  ): Promise<BlogSubscriptionsOrmEntity> {
    const instance = this.blogSubscriptionRepo.create(dto);

    return this.blogSubscriptionRepo.save(instance);
  }

  async delete(blogId: string, userId: string): Promise<void> {
    await this.blogSubscriptionRepo.delete({
      blogId,
      userId,
    });
  }

  async countSubscribers(blogId: string): Promise<number> {
    return this.blogSubscriptionRepo.count({
      where: { blogId },
    });
  }

  async findSubscribersByBlogId(blogId: string): Promise<string[]> {
    const subscriptions = await this.blogSubscriptionRepo.findBy({ blogId });

    const userIds = subscriptions.map((subscribe) => subscribe.userId);

    return userIds;
  }
}

// ? !! - превращает значения в true / false
