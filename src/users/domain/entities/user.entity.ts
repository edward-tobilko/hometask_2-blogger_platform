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
  static validateLogin(login: string): void {
    if (!login || login.trim().length === 0)
      throw new ValidationError("Login is required", "login", 400);

    const normalizedLogin = login.trim();

    if (normalizedLogin.length > 10)
      throw new ValidationError(
        "Login must not exceed 10 characters",
        "login",
        400
      );

    if (normalizedLogin.length < 3)
      throw new ValidationError(
        "Login must be at least 3 characters",
        "login",
        400
      );

    if (!login.match(/^[a-zA-Z0-9_-]*$/))
      throw new ValidationError("Login must be valid!", "login", 400);
  }

  static validateEmail(email: string): void {
    if (!email || email.trim().length === 0)
      throw new ValidationError("Email is required", "email", 400);

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(normalizedEmail))
      throw new ValidationError("Email must be valid", "email", 400);
  }

  private static validatePasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new ValidationError("Password hash is required", "password", 400);
    }
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
    UserEntity.validateEmail(dto.email);
    UserEntity.validatePasswordHash(dto.password);

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
    const emailConfirmation = {
      confirmationCode: "",
      expirationDate: null,
      isConfirmed: true,
    };

    UserEntity.validateLogin(dto.login);
    UserEntity.validateEmail(dto.email);
    UserEntity.validatePasswordHash(dto.password);

    return new UserEntity({
      id: randomUUID(),
      login: dto.login,
      email: dto.email,
      createdAt: new Date(),

      passwordHash: dto.password,

      emailConfirmation,

      recoveryPasswordInfo: null,
    });
  }

  setRecoveryPassword(): void {
    // * Генерируем новый код и новый дедлайн
    this.props.recoveryPasswordInfo = {
      recoveryCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
    };
  }

  checkAndSetNewPassword(newPassword: string, recoveryCode: string): void {
    const info = this.recoveryPasswordInfo;

    if (
      !info?.recoveryCode ||
      !info.expirationDate ||
      info.recoveryCode !== recoveryCode ||
      info.expirationDate.getTime() < Date.now()
    )
      throw new ValidationError(
        "RecoveryCode is incorrect or expired",
        "recoveryCode",
        400
      );

    this.props.passwordHash = newPassword; // hash придет снаружи
    this.props.recoveryPasswordInfo = null;
  }

  confirmEmail(code: string): void {
    if (
      !this.props.emailConfirmation.confirmationCode ||
      this.props.emailConfirmation.confirmationCode !== code
    ) {
      throw new ValidationError("Incorrect code", "code", 400);
    }

    if (
      this.props.emailConfirmation.expirationDate &&
      this.props.emailConfirmation.expirationDate < new Date()
    ) {
      throw new ValidationError(
        "Expiration date of confirmation code is ended",
        "code",
        400
      );
    }

    if (this.props.emailConfirmation.isConfirmed)
      throw new ValidationError("Email is already confirmed", "code", 400);

    this.props.emailConfirmation.confirmationCode = "";
    this.props.emailConfirmation.expirationDate = null;
    this.props.emailConfirmation.isConfirmed = true;
  }

  setNewEmailConfirm(): void {
    this.props.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
      isConfirmed: false,
    };
  }
}
