import { Types as MongooseTypes } from "mongoose";
import { injectable } from "inversify";

import {
  IEmailConfirmationUpdate,
  IRecoveryPasswordInfo,
  IUsersRepository,
} from "users/interfaces/IUsersRepository";
import {
  UserDb,
  UserDocument,
  UserModel,
} from "users/mongoose/user-schema.mongoose";

@injectable()
export class UsersRepository implements IUsersRepository {
  async createUser(user: UserDb): Promise<UserDocument> {
    // * Создаем экземпляр модели юзера и передаем ему объект user, для того что бы передать модели наши поля, которые нам нужны (обязательно все, так как монгус по валидации потом не пропустит).
    const userDocument = new UserModel(user);

    // * Сохраняем с пом. meta методом mongoose нашь екземпляр
    await userDocument.save();

    return userDocument;
  }

  async deleteUser(id: string): Promise<boolean> {
    // * Проверяем, является ли ObjectId действительным
    if (!MongooseTypes.ObjectId.isValid(id)) return false;

    const isDeleted = await UserModel.deleteOne({ _id: id });

    return isDeleted.deletedCount === 1;
  }

  async updateEmailUserConfirmationStatus(
    userId: MongooseTypes.ObjectId
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
    userId: MongooseTypes.ObjectId,
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
    userId: MongooseTypes.ObjectId,
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
    userId: MongooseTypes.ObjectId,
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
