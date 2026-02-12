import { injectable } from "inversify";
import { Types } from "mongoose";

import { mapToUsersListOutput } from "../applications/mappers/users-list-domain-to-output.mapper";
import { UsersListPaginatedOutput } from "../applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "../applications/query-handlers/get-users-list.query-handler";
import { UserOutput } from "../applications/output/user.output";
import { mapToUserOutput } from "../applications/mappers/user-domain-to-output.mapper";
import { IUsersQueryRepository } from "users/interfaces/IUsersQueryRepository";
import { UserDomain } from "users/domain/user.domain";
import { UserModel } from "users/mongoose/users.schema";
import { mapUserDocToDomain } from "users/applications/mappers/user-doc-to-domain.mapper";

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

    const items = await UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalCount = await UserModel.countDocuments(filter);

    const usersListOutput = mapToUsersListOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return usersListOutput;
  }

  async findByLogin(login: string): Promise<UserDomain | null> {
    const document = await UserModel.findOne({ login }).exec();

    return document ? mapUserDocToDomain(document) : null;
  }

  async findByEmail(email: string): Promise<UserDomain | null> {
    const document = await UserModel.findOne({ email }).exec();

    return document ? mapUserDocToDomain(document) : null;
  }

  async findUserByEmailAndNotConfirmCode(
    emailConfirmCode: string
  ): Promise<UserDomain | null> {
    const userAccount = await UserModel.findOne({
      "emailConfirmation.confirmationCode": emailConfirmCode,
    }).exec();

    return userAccount ? mapUserDocToDomain(userAccount) : null;
  }

  async findUserById(userId: string): Promise<UserOutput | null> {
    // * Проверяем, является ли ObjectId действительным
    if (!Types.ObjectId.isValid(userId)) return null;

    const userDomain = await UserModel.findById(userId).exec();

    if (!userDomain) return null;

    return userDomain ? mapToUserOutput(userDomain) : null;
  }

  async findUserByRecoveryCode(
    recoveryCode: string
  ): Promise<UserDomain | null> {
    const doc = await UserModel.findOne({
      "recoveryPasswordInfo.recoveryCode": recoveryCode,
    }).exec();

    return doc ? mapUserDocToDomain(doc) : null;
  }
}

// ? .exec() - реально запускаешь query, получаешь нормальный Promise<UserDocument | null>, корректные типы в TS, лучший stacktrace при ошибке.
// ? .lean() - возвращает plain object.
