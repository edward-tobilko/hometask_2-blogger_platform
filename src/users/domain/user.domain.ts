import { ObjectId, WithId } from "mongodb";
import { randomUUID } from "crypto";
import { add } from "date-fns";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { UserDtoDomain } from "./user-dto.domain";

export class UserDomain {
  _id?: ObjectId;
  login: string;
  email: string;
  createdAt: Date;

  passwordHash: string;

  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  constructor(dto: FieldsOnly<UserDomain>) {
    this._id = dto._id;
    this.login = dto.login;
    this.email = dto.email;
    this.createdAt = dto.createdAt;

    this.passwordHash = dto.passwordHash;

    this.emailConfirmation = {
      confirmationCode: dto.emailConfirmation.confirmationCode,
      expirationDate: dto.emailConfirmation.expirationDate,
      isConfirmed: dto.emailConfirmation.isConfirmed,
    };

    if (dto._id) {
      this._id = dto._id;
    }
  }

  static createUser(dto: UserDtoDomain): UserDomain {
    return new UserDomain({
      login: dto.login,
      email: dto.email,
      createdAt: new Date(),

      passwordHash: dto.password,

      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        isConfirmed: false,
      },
    });
  }

  // * для POST / users ( админ создал — сразу emailConfirmation -> isConfirmed = true )
  static createAdminUser(dto: UserDtoDomain): UserDomain {
    return new UserDomain({
      login: dto.login,
      email: dto.email,
      createdAt: new Date(),

      passwordHash: dto.password,

      emailConfirmation: {
        confirmationCode: "",
        expirationDate: null,
        isConfirmed: true,
      },
    });
  }

  static reconstitute(dto: UserDomain): WithId<UserDomain> {
    return new UserDomain(dto) as WithId<UserDomain>;
  }
}
