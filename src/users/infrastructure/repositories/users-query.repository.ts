import { injectable } from "inversify";
import { Types as MongooseTypes } from "mongoose";

import { IUsersQueryRepository } from "users/application/interfaces/users-query-repo.interface";
import { UserOutput } from "users/application/output/user.output";
import { UsersListPaginatedOutput } from "users/application/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "users/application/query-handlers/get-users-list.query-handler";
import { UserMapper } from "users/domain/mappers/user.mapper";
import { UserModel, UserLean } from "users/infrastructure/schemas/user-schema";

@injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
  async getUsersList(
    queryParam: GetUsersListQueryHandler
  ): Promise<UsersListPaginatedOutput> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    } = queryParam;

    const loginTerm = searchLoginTerm ? searchLoginTerm.trim() : null;
    const emailTerm = searchEmailTerm ? searchEmailTerm.trim() : null;

    let filter: Record<string, unknown> = {};

    if (loginTerm && emailTerm) {
      filter = {
        $or: [
          { login: { $regex: loginTerm, $options: "i" } },
          { email: { $regex: emailTerm, $options: "i" } },
        ],
      };
    } else if (loginTerm) {
      filter = { login: { $regex: loginTerm, $options: "i" } };
    } else if (emailTerm) {
      filter = { email: { $regex: emailTerm, $options: "i" } };
    } else {
      filter = {};
    }

    const [usersDocument, totalCount] = await Promise.all([
      UserModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean<UserLean[]>()
        .exec(),

      UserModel.countDocuments(filter),
    ]);

    const usersEntity = usersDocument.map((userDoc) =>
      UserMapper.toDomain(userDoc)
    );

    return UserMapper.toViewModelList(
      { pageNumber, pageSize, totalCount },
      usersEntity
    );
  }

  async findByLogin(login: string): Promise<UserLean | null> {
    return await UserModel.findOne({ login }).lean().exec();
  }

  async findByEmail(email: string): Promise<UserLean | null> {
    return await UserModel.findOne({ email }).lean().exec();
  }

  async findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserLean | null> {
    const userAccount = await UserModel.findOne({
      "emailConfirmation.confirmationCode": emailConfirmCode,
    })
      .lean()
      .exec();

    return userAccount;
  }

  async findUserById(userId: string): Promise<UserOutput | null> {
    // * Проверяем, является ли ObjectId действительным
    if (!MongooseTypes.ObjectId.isValid(userId)) return null;

    const user = await UserModel.findById(userId).lean().exec();

    if (!user) return null;

    return user;
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<UserLean | null> {
    const document = await UserModel.findOne({
      "recoveryPasswordInfo.recoveryCode": recoveryCode,
    })
      .lean()
      .exec();

    return document;
  }
}

// ? .exec() - запускает query, получает нормальный Promise<UserDocument | null>, корректные типы в TS, лучший stacktrace при ошибке (по дефолту модель под капотом так же вызывает этот метод, но не так чисто, лучше явно указать).
// ? .lean() - возвращает plain object: возвращает только тот объект, который мы описали (без мета свойст и методов от монгуса).
