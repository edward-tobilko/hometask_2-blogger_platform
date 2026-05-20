import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NewestLikes {
  @Prop({ type: Date })
  addedAt!: Date;

  @Prop({ type: String })
  userId!: string;

  @Prop({ type: String })
  login!: string;
}

export const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);
