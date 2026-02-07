import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { userCollection } from "../../db/mongo.db";
import { UserDB } from "db/types.db";
import {
  IEmailConfirmationUpdate,
  IRecoveryPasswordInfo,
  IUsersRepository,
} from "users/interfaces/IUsersRepository";

@injectable()
export class UsersRepository implements IUsersRepository {
  async createUser(user: UserDB): Promise<UserDB> {
    const insertResult = await userCollection.insertOne(user);

    user._id = insertResult.insertedId;

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    // * Проверяем, является ли ObjectId действительным
    if (!ObjectId.isValid(id)) return false;

    const isDeleted = await userCollection.deleteOne({ _id: new ObjectId(id) });

    return isDeleted.deletedCount === 1;
  }

  async updateEmailUserConfirmationStatus(userId: ObjectId): Promise<boolean> {
    const result = await userCollection.updateOne(
      { _id: userId },

      {
        $set: {
          "emailConfirmation.isConfirmed": true,
        },
      }
    );

    return result.modifiedCount === 1;
  }

  async updateEmailUserConfirmation(
    userId: ObjectId,
    emailConfirmation: IEmailConfirmationUpdate
  ): Promise<boolean> {
    const result = await userCollection.updateOne(
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

    return result.modifiedCount === 1;
  }

  async sendRecoveryPasswordEmail(
    userId: ObjectId,
    emailRecoveryInfo: IRecoveryPasswordInfo
  ): Promise<void> {
    await userCollection.updateOne(
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
    userId: ObjectId,
    newHash: string
  ): Promise<boolean> {
    const result = await userCollection.updateOne(
      { _id: userId },

      {
        $set: { passwordHash: newHash },
        $unset: { recoveryPasswordInfo: "" }, // field "recoveryPasswordInfo" from UserDomain - затираем его после установки нового пароля
      }
    );

    return result.matchedCount === 1 && result.modifiedCount === 1;
  }
}
