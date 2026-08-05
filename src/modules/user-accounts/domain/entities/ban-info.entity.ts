import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BanInfo {
  @Prop({ type: Boolean, default: false })
  isBanned!: boolean;

  @Prop({ type: String, default: null })
  banReason!: string | null;

  @Prop({ type: Date, default: null })
  bannedAt!: Date | null;

  @Prop({ type: Date, default: null })
  banExpiresAt!: Date | null;
}

export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
