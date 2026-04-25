import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class FullName {
  @Prop({ type: String, required: true })
  firstName!: string;

  @Prop({ type: String, required: false, default: null })
  lastName!: string | null;
}

export const NameSchema = SchemaFactory.createForClass(FullName);
