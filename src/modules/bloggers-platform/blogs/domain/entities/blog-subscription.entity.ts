import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { CreateBlogSubscriptionDomainDto } from '../dto/create-blog-subscription.domain-dto';

@Schema({ timestamps: false, collection: 'blog-subscription' })
export class BlogSubscription {
  @Prop({ type: String, required: true }) // ← это уже Mongoose схема (BlogSubscriptionSchema)
  userId!: string; // кто подписываеться (В MongoDB идентификаторы хранятся как string)

  @Prop({ type: String, required: true })
  blogId!: string; // на что подписываемся

  @Prop({ type: Date, index: true }) // ускоряем поиск по индексу в бд
  subscribedAt!: Date; // когда подписался

  static createInstance(
    dto: CreateBlogSubscriptionDomainDto,
  ): BlogSubscriptionDocument {
    const blogSubscription = new this(); // this is BlogSubscription

    blogSubscription.userId = dto.userId;
    blogSubscription.blogId = dto.blogId;
    blogSubscription.subscribedAt = new Date();

    return blogSubscription as BlogSubscriptionDocument;
  }
}

export const BlogSubscriptionSchema =
  SchemaFactory.createForClass(BlogSubscription); // Это NestJS-утилита (читает только свойста)

BlogSubscriptionSchema.loadClass(BlogSubscription); // Это уже нативный метод Mongoose, не NestJS (для подгрузки методов)

export type BlogSubscriptionDocument =
  mongoose.HydratedDocument<BlogSubscription>;
export type BlogSubscriptionLean = BlogSubscription & {
  _id: mongoose.Types.ObjectId;
};

export type BlogSubscriptionModel = mongoose.Model<BlogSubscriptionDocument> &
  typeof BlogSubscription; // типизация модели + статические методы домена
