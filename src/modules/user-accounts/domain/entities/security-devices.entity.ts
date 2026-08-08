import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { CreateSecurityDevicesDomainDto } from '../dto/create-security-devices.dto';

@Schema({ collection: 'security-devices-session', timestamps: false })
export class SecurityDevices {
  @Prop({
    type: String,
    required: true,
  })
  ip!: string; // for example -> 127.0.0.1

  @Prop({ type: String, required: true })
  title!: string; // user's browser device name

  @Prop({ type: Date, required: true })
  lastActiveDate!: Date; // момент выдачи текущего refresh token

  @Prop({ type: String, required: true, unique: true })
  deviceId!: string; // uuid v4, генерируеться при login

  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt!: Date; // время жизни документа в mongodb (когда токен протухнет сам) -> копируется из JWT payload (поле "exp")

  private static buildBaseSecurityDeviceInstance(
    payload: CreateSecurityDevicesDomainDto,
  ) {
    const securityDevices = new this(); // -> Экземпляр SecurityDevices (HydratedDocument после приведения типа)

    securityDevices.ip = payload.ip;
    securityDevices.title = payload.title;
    securityDevices.deviceId = payload.deviceId;
    securityDevices.lastActiveDate = payload.lastActiveDate;

    securityDevices.userId = payload.userId;
    securityDevices.expiresAt = payload.expiresAt;

    return securityDevices;
  }

  static createSecurityDeviceInstance(
    dto: CreateSecurityDevicesDomainDto,
  ): SecurityDevicesDocument {
    const securityDevices = this.buildBaseSecurityDeviceInstance(dto);

    return securityDevices as SecurityDevicesDocument;
  }
}

export type SecurityDevicesDocument = HydratedDocument<SecurityDevices>;
export type SecurityDevicesLean = SecurityDevices & { _id: Types.ObjectId };
export type SecurityDevicesModel = Model<SecurityDevicesDocument> &
  typeof SecurityDevices;

export const SecurityDevicesSchema =
  SchemaFactory.createForClass(SecurityDevices);

SecurityDevicesSchema.loadClass(SecurityDevices);

// ? expires: 0 - означает: удалить документ ровно в момент когда наступит expiresAt.
