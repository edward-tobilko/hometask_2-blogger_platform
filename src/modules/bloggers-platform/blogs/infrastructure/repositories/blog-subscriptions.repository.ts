import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

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

  async existsByUserAndBlog(userId: string, blogId: string): Promise<boolean> {
    const subscription = await this.blogSubscriptionModel
      .findOne({
        userId,
        blogId: new Types.ObjectId(blogId),
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
    await this.blogSubscriptionModel
      .deleteOne({ blogId: new Types.ObjectId(blogId), userId })
      .exec();
  }

  async countSubscribers(blogId: string): Promise<number> {
    return this.blogSubscriptionModel.countDocuments({
      blogId: new Types.ObjectId(blogId),
    });
  }

  async findSubscribersByBlogId(blogId: string): Promise<string[]> {
    const subscriptions = await this.blogSubscriptionModel
      .find({
        $or: [
          {
            blogId: new Types.ObjectId(blogId), // if ObjectId in collection
          },
          { blogId: blogId }, // if string in collection
        ],
      })
      .lean()
      .exec();

    const userIds = subscriptions.map((subscribe) => subscribe.userId); // ["6a625c2033ccfc34e67abb6e", "6a08af945164161f990299a6"]

    return userIds;
  }
}

// ? !! - превращает значения в true / false
