import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDto } from '../api/dto/create-post.dto';

@Schema({ timestamps: true })
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
  blogId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  blogName!: string;

  @Prop({ type: Date, index: true }) // ускоряем поиск по индексу в бд = даст нам первые 10 отсортированных елементов
  createdAt!: Date;

  extendedLikesInfo!: {
    likesCount: number;
    dislikesCount: number;

    newestLikes: Array<{
      addedAt: Date;
      userId: string;
      login: string;
    }>;
  };

  static createPostInstance(dto: CreatePostDto): PostDocument {
    const post = new this(); // this is post / PostModel, NOT PostDocument

    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;

    return post as PostDocument;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostLean = Post & { _id: Types.ObjectId };

export type PostModel = Model<PostDocument> & typeof Post;
