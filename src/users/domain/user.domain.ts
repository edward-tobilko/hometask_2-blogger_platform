import { ObjectId, WithId } from "mongodb";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { UserDtoDomain } from "./user-dto.domain";

export class UserDomain {
  _id?: ObjectId;
  login: string;
  email: string;
  createdAt: Date;

  constructor(dto: FieldsOnly<UserDomain>) {
    this._id = dto._id;
    this.login = dto.login;
    this.email = dto.email;
    this.createdAt = dto.createdAt;

    if (dto._id) {
      this._id = dto._id;
    }
  }

  static createUser(dto: UserDtoDomain): UserDomain {
    return new UserDomain({
      login: dto.login,
      email: dto.email,
      createdAt: new Date(),
    });
  }

  static reconstitute(dto: UserDomain): WithId<UserDomain> {
    return new UserDomain(dto) as WithId<UserDomain>;
  }
}
