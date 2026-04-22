import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import {
  CommentatorInfo,
  LikesInfoSchema,
} from 'src/core/sub-schemas/sub.schemas';
import { Post } from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId!: Types.ObjectId;

  @Prop({
    type: CommentatorInfo,
    required: true,
  })
  commentatorInfo!: {
    userId: string;
    userLogin: string;
  };

  @Prop({ type: Date, index: true }) // ускоряем поиск по индексу в бд = первые 10 отсортированных елементов
  createdAt!: Date;

  @Prop({ type: LikesInfoSchema, required: false })
  likesInfo!: {
    likesCount: number;
    dislikesCount: number;
  };
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentLean = Comment & { _id: Types.ObjectId };

export type CommentModel = Model<CommentDocument> & typeof Comment;
