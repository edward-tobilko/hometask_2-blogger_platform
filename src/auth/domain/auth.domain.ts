import { ObjectId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { UserDB } from "db/types.db";

// * BLL - AuthDomain - бизнес модель
export class AuthDomain {
  _id?: ObjectId;
  email: string;
  login: string;
  userId: ObjectId;

  constructor(dto: FieldsOnly<AuthDomain>) {
    this.email = dto.email;
    this.login = dto.login;
    this.userId = dto.userId;

    if (dto._id) {
      this._id = dto._id;
    }
  }

  static createMe(user: UserDB): AuthDomain {
    return new AuthDomain({
      email: user.email,
      login: user.login,
      userId: user._id!,
    });
  }
}
