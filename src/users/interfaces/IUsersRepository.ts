import { ObjectId } from "mongodb";

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
  createUser(user: UserDB): Promise<UserDB>;

  deleteUser(id: string): Promise<boolean>;

  updateEmailUserConfirmationStatus(userId: ObjectId): Promise<boolean>;

  updateEmailUserConfirmation(
    userId: ObjectId,
    emailConfirmation: IEmailConfirmationUpdate
  ): Promise<boolean>;

  sendRecoveryPasswordEmail(
    userId: ObjectId,
    emailRecoveryPass: IRecoveryPasswordInfo
  ): Promise<void>;

  updatePasswordAndClearRecovery(
    userId: ObjectId,
    newHash: string
  ): Promise<boolean>;
}
