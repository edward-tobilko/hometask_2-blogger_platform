import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type BlogDocument = mongoose.HydratedDocument<Blog>;
export type BlogLean = Blog & { _id: mongoose.Types.ObjectId };

let blogDoc: BlogDocument; // монгусный умный обьект с его методами

@Schema({ timestamps: false })
export class Blog {
  @Prop({
    required: true,
    maxlength: [15, 'Name must not exceed 15 characters'],
  })
  name!: string;

  @Prop({
    required: true,
    maxlength: [500, 'Description must not exceed 500 characters'],
  })
  description!: string;

  @Prop({
    required: true,
    maxlength: [100, 'Website url must not exceed 100 characters'],
    match: [/^https:\/\/.+/i, 'Website URL must be a valid https URL'],
  })
  websiteUrl!: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;

  @Prop({ required: true, default: false })
  isMembership!: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// ? В Nest схема создаеться через декларативный подход через декораторы: @Schema / @Prop.
// ? @Prop - декоратор поля, описывает свойство схемы. Может принимать те же опции, что и обычный Mongoose: required, default, maxlength, min, max, enum, unique, и т.д.
// ? SchemaFactory.createForClass(Blog) — превращает класс с декораторами в обычную Mongoose-схему. Это нужно для Nest-овой регистрации.
// ? class Blog сам по себе — это и тип (TypeScript видит его как тип), и источник схемы (декораторы превращают его в Mongoose-схему). Теперь не нужно дублировать описание полей в типе и в схеме, как пришлось бы делать в чистом подходе.
