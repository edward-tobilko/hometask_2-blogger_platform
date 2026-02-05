import { ObjectId } from "mongodb";

import { UserDB } from "db/types.db";

export interface IEmailConfirmationUpdate {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export interface IEmailRecoveryPassword {
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
    emailRecoveryPass: IEmailRecoveryPassword
  ): Promise<void>;
}
