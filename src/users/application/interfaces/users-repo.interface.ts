import { Types } from "mongoose";

import { UserDb, UserDocument } from "users/infrastructure/schemas/user-schema";

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
  createUser(user: UserDb): Promise<UserDocument>;

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
