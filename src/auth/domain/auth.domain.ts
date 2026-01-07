import { ObjectId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { UserDB } from "db/types.db";

// * BLL - AuthDomain - бизнес модель
export class AuthDomain {
  _id?: ObjectId;
  email: string;
  login: string;
  userId: ObjectId;
  deviceId: string; // UUID
  refreshToken: string; // cookie

  constructor(dto: FieldsOnly<AuthDomain>) {
    this.email = dto.email;
    this.login = dto.login;
    this.userId = dto.userId;
    this.deviceId = dto.deviceId;
    this.refreshToken = dto.refreshToken;

    if (dto._id) {
      this._id = dto._id;
    }
  }

  static createMe(
    user: UserDB,
    deviceId: string,
    refreshToken: string
  ): AuthDomain {
    return new AuthDomain({
      email: user.email,
      login: user.login,
      userId: user._id!,
      deviceId,
      refreshToken,
    });
  }
}
