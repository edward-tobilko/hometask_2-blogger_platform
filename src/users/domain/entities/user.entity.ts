import { randomUUID } from "crypto";
import { add } from "date-fns";

import { FieldsOnly } from "../../../core/types/fields-only.type";
import { UserDtoDomain } from "../value-objects/user-dto.domain";
import { IRecoveryPasswordInfo } from "users/application/interfaces/users-repo.interface";
import { ValidationError } from "@core/errors/application.error";

type UserEntityProps = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  passwordHash: string;

  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  recoveryPasswordInfo?: IRecoveryPasswordInfo | null;
};

export class UserEntity {
  private constructor(private props: FieldsOnly<UserEntityProps>) {}

  // * Getters
  get id(): string {
    return this.props.id;
  }

  get login(): string {
    return this.props.login;
  }

  get email(): string {
    return this.props.email;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get emailConfirmation() {
    return this.props.emailConfirmation;
  }

  get recoveryPasswordInfo() {
    return this.props.recoveryPasswordInfo;
  }

  // * Factory validation methods
  private static validateLogin(login: string) {
    if (!login || login.trim().length === 0)
      throw new ValidationError("Login is required", "login", 400);

    if (login.length > 10)
      throw new ValidationError(
        "Login must not exceed 10 characters",
        "login",
        400
      );

    if (login.length < 3)
      throw new ValidationError(
        "Login must not exceed 3 characters",
        "login",
        400
      );
  }

  // * Factory methods
  static reconstitute(props: {
    id: string;
    login: string;
    email: string;
    createdAt: Date;

    passwordHash: string;

    emailConfirmation: {
      confirmationCode: string | null;
      expirationDate: Date | null;
      isConfirmed: boolean;
    };

    recoveryPasswordInfo?: IRecoveryPasswordInfo | null;
  }): UserEntity {
    return new UserEntity(props);
  }

  static createUser(dto: UserDtoDomain): UserEntity {
    UserEntity.validateLogin(dto.login);

    return new UserEntity({
      id: randomUUID(),
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
  static createAdminUser(dto: UserDtoDomain): UserEntity {
    return new UserEntity({
      id: randomUUID(),
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
