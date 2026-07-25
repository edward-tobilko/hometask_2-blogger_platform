import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import {
  BlogSubscription,
  BlogSubscriptionDocument,
  BlogSubscriptionModel,
} from '../../domain/entities/blog-subscription.entity';
import { CreateBlogSubscriptionDomainDto } from '../../domain/dto/create-blog-subscription.domain-dto';

@Injectable()
export class BlogSubscriptionsRepository {
  constructor(
    @InjectModel(BlogSubscription.name)
    private blogSubscriptionModel: BlogSubscriptionModel,
  ) {}

  /**
   * Проверяем существует ли уже подписка этого пользователя на этот блог?
   */
  async existsByUserAndBlog(userId: string, blogId: string): Promise<boolean> {
    const subscription = await this.blogSubscriptionModel
      .findOne({
        userId,
        blogId,
      })
      .exec();

    return !!subscription;
  }

  async createAndSave(
    dto: CreateBlogSubscriptionDomainDto,
  ): Promise<BlogSubscriptionDocument> {
    const instance = this.blogSubscriptionModel.createInstance(dto);

    await instance.save();

    return instance;
  }

  async delete(blogId: string, userId: string): Promise<void> {
    await this.blogSubscriptionModel.deleteOne({ blogId, userId }).exec();
  }

  async countSubscribers(blogId: string): Promise<number> {
    return this.blogSubscriptionModel.countDocuments({
      blogId,
    });
  }
}

// ? !! - превращает значения в true or false
