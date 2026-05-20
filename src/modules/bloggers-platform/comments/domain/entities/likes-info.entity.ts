import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { LikeStatus } from 'src/core/enums/like-status.enum';

@Schema({ _id: false })
export class LikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount!: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount!: number;

  @Prop({ type: [{ userId: String, status: String }], default: [] })
  userReactions!: { userId: string; status: LikeStatus }[];
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
