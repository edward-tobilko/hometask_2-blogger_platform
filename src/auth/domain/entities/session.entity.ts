import { randomUUID } from "crypto";

import { FieldsOnly } from "../../../core/types/fields-only.type";
import { UserEntity } from "users/domain/entities/user.entity";

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

export class SessionEntity {
  private constructor(private props: FieldsOnly<SessionEntityProp>) {}

  // * Getters
  get id(): string {
    return this.props.id;
  }
  get login(): string {
    return this.props.login;
  }
  get userId(): string {
    return this.props.userId;
  }
  get deviceId(): string {
    return this.props.deviceId;
  }
  get sessionId(): string {
    return this.props.sessionId;
  }
  get ip(): string {
    return this.props.ip;
  }
  get userDeviceName(): string {
    return this.props.userDeviceName;
  }
  get lastActiveDate(): Date {
    return this.props.lastActiveDate;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get refreshIat(): number {
    return this.props.refreshIat;
  }

  // * Factory validation methods

  // * Fabric methods
  static reconstitute(props: {
    id: string;

    login: string;

    userId: string;
    deviceId: string;
    sessionId: string;
    ip: string;
    userDeviceName: string;

    lastActiveDate: Date;
    expiresAt: Date;
    createdAt: Date;

    refreshIat: number;
  }): SessionEntity {
    return new SessionEntity(props);
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
    UserEntity.validateLogin(dto.login);

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
