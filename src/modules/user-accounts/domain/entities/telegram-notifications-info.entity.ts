import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class TelegramNotificationsInfo {
  @Prop({ type: String, default: null })
  telegramChatId!: string | null;

  @Prop({ type: String, default: null })
  telegramConfirmationCode!: string | null;
}

export const TelegramNotificationsInfoSchema = SchemaFactory.createForClass(
  TelegramNotificationsInfo,
);
