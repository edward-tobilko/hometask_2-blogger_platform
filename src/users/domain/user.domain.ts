import { randomUUID } from "crypto";
import { add } from "date-fns";

import { FieldsOnly } from "../../core/types/fields-only.type";
import { UserDtoDomain } from "./user-dto.domain";
import { IRecoveryPasswordInfo } from "users/interfaces/IUsersRepository";

export class UserDomain {
  id?: string;
  login: string;
  email: string;
  createdAt: Date;

  passwordHash: string;

  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  recoveryPasswordInfo?: IRecoveryPasswordInfo | null;

  constructor(dto: FieldsOnly<UserDomain>) {
    this.id = dto.id;
    this.login = dto.login;
    this.email = dto.email;
    this.createdAt = dto.createdAt;

    this.passwordHash = dto.passwordHash;

    this.emailConfirmation = {
      confirmationCode: dto.emailConfirmation.confirmationCode,
      expirationDate: dto.emailConfirmation.expirationDate,
      isConfirmed: dto.emailConfirmation.isConfirmed,
    };

    this.recoveryPasswordInfo = dto.recoveryPasswordInfo ?? null;
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

      recoveryPasswordInfo: null,
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

      recoveryPasswordInfo: null,
    });
  }
}
