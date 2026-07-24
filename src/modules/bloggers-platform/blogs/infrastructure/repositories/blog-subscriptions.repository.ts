import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

import {
  BlogSubscription,
  BlogSubscriptionDocument,
  BlogSubscriptionModel,
} from '../../domain/entities/blog-subscription.entity';
import { CreateBlogSubscriptionDomainDto } from '../../domain/dto/create-blog-subscription.domain-dto';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/infrastructure/external-query/users.external-query-repo';
import { Blog, BlogModelType } from '../../domain/entities/blog.entity';

@Injectable()
export class BlogSubscriptionsRepository {
  constructor(
    @InjectModel(BlogSubscription.name)
    private blogSubscriptionModel: BlogSubscriptionModel,

    @InjectModel(Blog.name) private blogModel: BlogModelType,

    private readonly usersExternalQueryRepo: UsersExternalQueryRepository,
  ) {}

  async existsByUserAndBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean | null> {
    const existingUser =
      await this.usersExternalQueryRepo.getByIdOrNotFoundFail(userId);

    if (!existingUser) return null;

    const existingBlog = await this.blogModel.findById(blogId);

    if (!existingBlog) return null;
  }

  async createAndSave(
    dto: CreateBlogSubscriptionDomainDto,
  ): Promise<BlogSubscriptionDocument> {
    const instance = this.blogSubscriptionModel.createInstance({
      userId: dto.userId,
      blogId: dto.blogId,
    });

    await instance.save();

    return instance;
  }
}
