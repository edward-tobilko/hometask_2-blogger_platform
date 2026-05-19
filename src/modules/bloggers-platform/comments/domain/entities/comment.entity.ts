import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { Post } from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentator-info.entity';
import { LikesInfoSchema } from '../schemas/likes-info.schema';
import { UpdateCommentDomainDto } from '../dto/update-comment.dto';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId!: Types.ObjectId;

  @Prop({
    type: CommentatorInfoSchema,
    required: true,
  })
  commentatorInfo!: CommentatorInfo;

  @Prop({ type: Date, index: true }) // ускоряем поиск по индексу в бд = первые 10 отсортированных елементов
  createdAt!: Date;

  @Prop({ type: LikesInfoSchema, required: false })
  likesInfo!: {
    likesCount: number;
    dislikesCount: number;
  };

  updateComment(dto: UpdateCommentDomainDto): void {
    this.content = dto.content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentLean = Comment & { _id: Types.ObjectId };

export type CommentModel = Model<CommentDocument> & typeof Comment;
