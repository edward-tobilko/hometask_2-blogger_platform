import { Types as MongooseTypes } from "mongoose";
import { injectable } from "inversify";

import { IUsersRepository } from "users/application/interfaces/users-repo.interface";
import { UserLean, UserModel } from "users/infrastructure/schemas/user-schema";
import { UserEntity } from "users/domain/entities/user.entity";
import { UserMapper } from "users/domain/mappers/user.mapper";

@injectable()
export class UsersRepository implements IUsersRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const userDocument = await UserModel.findOne({ email })
      .lean<UserLean>()
      .exec();

    if (!userDocument) return null;

    return UserMapper.toDomain(userDocument);
  }

  async findUserByRecoveryCode(
    recoveryCode: string
  ): Promise<UserEntity | null> {
    const document = await UserModel.findOne({
      "recoveryPasswordInfo.recoveryCode": recoveryCode,
    })
      .lean<UserLean>()
      .exec();

    if (!document) return null;

    return UserMapper.toDomain(document);
  }

  async findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserEntity | null> {
    const userDoc = await UserModel.findOne({
      "emailConfirmation.confirmationCode": emailConfirmCode,
    })
      .lean<UserLean>()
      .exec();

    if (!userDoc) return null;

    return UserMapper.toDomain(userDoc);
  }

  async save(userEntity: UserEntity): Promise<void> {
    await UserModel.updateOne(
      { _id: new MongooseTypes.ObjectId(userEntity.id) },
      {
        $set: {
          passwordHash: userEntity.passwordHash,
          recoveryPasswordInfo: userEntity.recoveryPasswordInfo ?? null,

          "emailConfirmation.isConfirmed":
            userEntity.emailConfirmation.isConfirmed,
          "emailConfirmation.confirmationCode":
            userEntity.emailConfirmation.confirmationCode,
          "emailConfirmation.expirationDate":
            userEntity.emailConfirmation.expirationDate,
        },
      }
    ).exec();
  }

  async createUser(userEntity: UserEntity): Promise<UserEntity> {
    // * Создаем экземпляр модели юзера и передаем ему объект user, для того что бы передать модели наши поля, которые нам нужны (обязательно все, так как монгус по валидации потом не пропустит).
    const userDb = UserMapper.toDb(userEntity);
    const userDocument = new UserModel(userDb);

    // * Сохраняем с пом. meta методом mongoose нашь екземпляр
    await userDocument.save(); // Active Record паттерн

    return UserMapper.toDomain(userDocument);
  }

  async deleteUser(id: string): Promise<boolean> {
    // * Проверяем, является ли ObjectId действительным
    if (!MongooseTypes.ObjectId.isValid(id)) return false;

    const isDeleted = await UserModel.deleteOne({ _id: id });

    return isDeleted.deletedCount === 1;
  }
}
