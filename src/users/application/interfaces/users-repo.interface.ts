import { UserEntity } from "@users/domain/entities/user.entity";

export interface IEmailConfirmationUpdate {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export interface IRecoveryPasswordInfo {
  recoveryCode: string;
  expirationDate: Date;
}

export interface IUsersRepository {
  findByEmail(email: string): Promise<UserEntity | null>;

  findUserByRecoveryCode(recoveryCode: string): Promise<UserEntity | null>;

  findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserEntity | null>;

  save(userEntity: UserEntity): Promise<void>;

  createUser(user: UserEntity): Promise<UserEntity>;

  deleteUser(id: string): Promise<boolean>;
}
