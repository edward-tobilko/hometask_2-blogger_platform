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
    type: [{ userId: String, login: String, status: String, addedAt: Date }],
    default: [],
  })
  userReactions!: {
    userId: string;
    login: string;
    status: LikeStatus;
    addedAt: Date;
  }[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

// ? userReactions — полный журнал всех реакций (источник правды). Нужен что бы:
// ? - знать текущий статус конкретного пользовате (myStatus)
// ? - пересчитывать newestLikes при изменении
// ? - при $pull — удалять старую реакцию перед добавлением новой

// ? newestLikes — только 3 последних Like (вычесляемый срез для вывода API). Это денормализованный кэш для быстрого чтения.
