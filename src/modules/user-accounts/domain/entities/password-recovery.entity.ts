import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({ default: null, type: String })
  recoveryCode!: string | null;

  @Prop({ default: null, type: Date })
  recoveryCodeExpiry!: Date | null;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
