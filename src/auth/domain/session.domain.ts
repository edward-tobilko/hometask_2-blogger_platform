import { ObjectId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { UserDB } from "db/types.db";

// * BLL - SessionDomain - бизнес модель
export class SessionDomain {
  _id?: ObjectId;

  login: string;

  userId: ObjectId;
  deviceId: string; // UUID
  sessionId: string;
  ip: string;
  userDeviceName: string; // user's browser device

  lastActiveDate: Date; // обновляем при refresh / при запросах, где нужно
  expiresAt: Date; // дата окончания (когда токен протухнет сам)
  createdAt: Date;

  refreshIat: number; // проверяет, последний ли был выданий токен

  constructor(dto: FieldsOnly<SessionDomain>) {
    this.userId = dto.userId;
    this.login = dto.login;
    this.deviceId = dto.deviceId;
    this.sessionId = dto.sessionId;
    this.ip = dto.ip;
    this.userDeviceName = dto.userDeviceName;

    this.lastActiveDate = dto.lastActiveDate;
    this.expiresAt = dto.expiresAt;
    this.createdAt = dto.createdAt;

    this.refreshIat = dto.refreshIat;

    if (dto._id) this._id = dto._id;
  }

  static saveMe(
    user: UserDB,
    dto: {
      deviceId: string;
      sessionId: string;
      ip: string;
      userDeviceName: string;
      expiresAt: Date;
      refreshIat: number;
    }
  ): SessionDomain {
    return new SessionDomain({
      userId: user._id!,

      login: user.login,

      deviceId: dto.deviceId,
      sessionId: dto.sessionId,
      ip: dto.ip,
      userDeviceName: dto.userDeviceName,

      lastActiveDate: new Date(),
      expiresAt: dto.expiresAt,
      createdAt: new Date(),

      refreshIat: dto.refreshIat,
    });
  }
}
