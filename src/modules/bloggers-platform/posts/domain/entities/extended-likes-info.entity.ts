import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { NewestLikesSchema } from './newest-like.entity';
import { LikeStatus } from 'src/core/enums/like-status.enum';

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount!: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount!: number;

  @Prop({ type: [NewestLikesSchema], default: [] })
  newestLikes!: { addedAt: Date; userId: string; login: string }[];

  // * поле для хранения всех реакций пользователей
  @Prop({
    type: [{ userId: String, login: String, status: String }],
    default: [],
  })
  userReactions!: { userId: string; login: string; status: LikeStatus }[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);
