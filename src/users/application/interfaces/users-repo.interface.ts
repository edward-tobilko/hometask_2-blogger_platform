import { Types } from "mongoose";

import { UserEntity } from "users/domain/entities/user.entity";

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
  createUser(user: UserEntity): Promise<UserEntity>;

  deleteUser(id: string): Promise<boolean>;

  updateEmailUserConfirmationStatus(userId: Types.ObjectId): Promise<boolean>;

  updateEmailUserConfirmation(
    userId: Types.ObjectId,
    emailConfirmation: IEmailConfirmationUpdate
  ): Promise<boolean>;

  sendRecoveryPasswordEmail(
    userId: Types.ObjectId,
    emailRecoveryPass: IRecoveryPasswordInfo
  ): Promise<void>;

  updatePasswordAndClearRecovery(
    userId: Types.ObjectId,
    newHash: string
  ): Promise<boolean>;
}
