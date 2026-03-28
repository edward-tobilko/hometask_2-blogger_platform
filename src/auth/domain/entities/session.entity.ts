import { randomUUID } from "crypto";

import { FieldsOnly } from "../../../core/types/fields-only.type";

type SessionEntityProp = {
  id: string;

  login: string;

  userId: string;
  deviceId: string; // UUID
  sessionId: string;
  ip: string;
  userDeviceName: string; // user's browser device

  lastActiveDate: Date; // обновляем при refresh / при запросах, где нужно
  expiresAt: Date; // дата окончания (когда токен протухнет сам)
  createdAt: Date;

  refreshIat: number; // проверяет, последний ли был выданий токен
};

// * BLL - SessionDomain - бизнес модель
export class SessionEntity {
  private constructor(private props: FieldsOnly<SessionEntityProp>) {}

  // * Getters
  get id() {
    return this.props.id;
  }

  static saveMe(dto: {
    userId: string;
    login: string;
    deviceId: string;
    sessionId: string;
    ip: string;
    userDeviceName: string;
    expiresAt: Date;
    refreshIat: number;
  }): SessionEntity {
    return new SessionEntity({
      id: randomUUID(),
      userId: dto.userId,
      login: dto.login,

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
