import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types, Schema } from 'mongoose';

import { CreatePostDomainDto } from './dto/create-post.domain-dto';
import { UpdatePostDomainDto } from './dto/update-post.domain-dto';

// * Subdocument schemas
const NewestLikeSchema = new Schema(
  {
    addedAt: { type: Date, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true },
  },
  { _id: false },
);

const ExtendedLikesInfoSchema = new Schema(
  {
    likesCount: { type: Number, required: true, default: 0 },
    dislikesCount: { type: Number, required: true, default: 0 },
    newestLikes: { type: [NewestLikeSchema], required: true, default: [] },
  },
  { _id: false },
);

@NestSchema({ timestamps: true })
export class Post {
  @Prop({
    type: String,
    required: true,
    maxLength: [30, 'Title must not exceed 30 characters'],
  })
  title!: string;

  @Prop({
    type: String,
    required: true,
    maxLength: [100, 'Short description must not exceed 100 characters'],
  })
  shortDescription!: string;

  @Prop({
    type: String,
    required: true,
    maxLength: [1000, 'Content must not exceed 1000 characters'],
  })
  content!: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  blogId!: Types.ObjectId; // for populate and ref

  @Prop({
    type: String,
    required: true,
  })
  blogName!: string;

  @Prop({ type: Date, index: true }) // ускоряем поиск по индексу в бд = даст нам первые 10 отсортированных елементов
  createdAt!: Date;

  @Prop({ type: ExtendedLikesInfoSchema, required: true })
  extendedLikesInfo!: {
    likesCount: number;
    dislikesCount: number;

    newestLikes: Array<{
      addedAt: Date;
      userId: string;
      login: string;
    }>;
  };

  static createPostInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this(); // this is Post / PostModel, NOT PostDocument

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = new Types.ObjectId(dto.blogId);

    post.blogName = dto.blogName;

    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    return post as PostDocument;
  }

  updatePost(dto: UpdatePostDomainDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostLean = Post & { _id: Types.ObjectId };

export type PostModel = Model<PostDocument> & typeof Post;
