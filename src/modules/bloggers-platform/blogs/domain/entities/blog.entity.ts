import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CreateBlogDomainDto } from '../dto/create-blog.domain-dto';
import { UpdateBlogDto } from '../../api/dto/update-blog.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    type: String,
    required: true,
    maxlength: [15, 'Name must not exceed 15 characters'],
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    maxlength: [500, 'Description must not exceed 500 characters'],
  })
  description!: string;

  @Prop({
    type: String,
    required: true,
    maxlength: [100, 'Website URL must not exceed 100 characters'],
    match: [/^https:\/\/.+/i, 'Website must be a valid https URL'],
  })
  websiteUrl!: string;

  @Prop({ type: Date, index: true }) // ускоряем поиск по индексу в бд = даст нам первые 10 отсортированных елементов
  createdAt!: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership!: boolean;

  static createBlogInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this(); // this is Blog / BlogModelType, NOT BlogDocument

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
  }

  update(dto: UpdateBlogDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog); // превращает класс с @Prop декораторами в голую Mongoose-схему. Он переносит только поля-свойства, а методы класса (инстанс-методы и статические) игнорируете.

BlogSchema.loadClass(Blog); // нативный метод Mongoose, не Nest. Он берет class и переносит наши созданные methods / statics / virtual в схему монгуса.

export type BlogDocument = mongoose.HydratedDocument<Blog>;
export type BlogLean = Blog & { _id: mongoose.Types.ObjectId };

export type BlogModelType = mongoose.Model<BlogDocument> & typeof Blog; // типизация модели + статические методы домена

// ? В Nest схема создаеться через декларативный подход через декораторы: @Schema / @Prop.
// ? @Prop - проверяет данные на выходе, перед сохранением в БД.
// ? class Blog сам по себе — это и тип (TypeScript видит его как тип), и источник схемы (декораторы превращают его в Mongoose-схему). Теперь не нужно дублировать описание полей в типе и в схеме, как пришлось бы делать в чистом подходе.
