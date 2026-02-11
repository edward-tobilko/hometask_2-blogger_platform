import { Types } from "mongoose";
import { injectable } from "inversify";

import {
  IEmailConfirmationUpdate,
  IRecoveryPasswordInfo,
  IUsersRepository,
} from "users/interfaces/IUsersRepository";
import { UserModel } from "users/mongoose/users.schema";
import { UserDomain } from "users/domain/user.domain";
import { mapUserDomainToDb } from "users/applications/mappers/user-domain-to-db.mapper";

@injectable()
export class UsersRepository implements IUsersRepository {
  async createUser(user: UserDomain): Promise<string> {
    const createdUserId = await UserModel.create(mapUserDomainToDb(user));

    return createdUserId._id.toString();
  }

  async deleteUser(id: string): Promise<boolean> {
    // * Проверяем, является ли ObjectId действительным
    if (!Types.ObjectId.isValid(id)) return false;

    const isDeleted = await UserModel.deleteOne({ _id: id });

    return isDeleted.deletedCount === 1;
  }

  async updateEmailUserConfirmationStatus(
    userId: Types.ObjectId
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },

      {
        $set: {
          "emailConfirmation.isConfirmed": true,
        },
      }
    );

    return result.matchedCount === 1;
  }

  async updateEmailUserConfirmation(
    userId: Types.ObjectId,
    emailConfirmation: IEmailConfirmationUpdate
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },

      {
        $set: {
          "emailConfirmation.confirmationCode":
            emailConfirmation.confirmationCode,
          "emailConfirmation.expirationDate": emailConfirmation.expirationDate,
          // "emailConfirmation.isConfirmed": true,
        },
      }
    );

    return result.matchedCount === 1;
  }

  async sendRecoveryPasswordEmail(
    userId: Types.ObjectId,
    emailRecoveryInfo: IRecoveryPasswordInfo
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },

      {
        $set: {
          recoveryPasswordInfo: {
            recoveryCode: emailRecoveryInfo.recoveryCode,
            expirationDate: emailRecoveryInfo.expirationDate,
          },
        },
      }
    );
  }

  async updatePasswordAndClearRecovery(
    userId: Types.ObjectId,
    newHash: string
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },

      {
        $set: { passwordHash: newHash },
        $unset: { recoveryPasswordInfo: "" }, // field "recoveryPasswordInfo" from UserDomain - затираем его после установки нового пароля
      }
    );

    return result.matchedCount === 1;
  }
}
