import { UserDb, UserLean } from "users/infrastructure/schemas/user-schema";
import { UserEntity } from "../entities/user.entity";
import { UsersListPaginatedOutput } from "users/application/output/users-list-paginated.output";
import { UserOutput } from "users/application/output/user.output";

export class UserMapper {
  // * DB -> Domain
  static toDomain(userDocument: UserLean): UserEntity {
    return UserEntity.reconstitute({
      id: userDocument._id.toString(),
      login: userDocument.login,
      email: userDocument.email,
      createdAt: userDocument.createdAt,

      passwordHash: userDocument.passwordHash,

      emailConfirmation: userDocument.emailConfirmation,
      recoveryPasswordInfo: userDocument.recoveryPasswordInfo,
    });
  }

  // * Domain -> DB
  static toDb(entity: UserEntity): UserDb {
    return {
      login: entity.login,
      email: entity.email,
      createdAt: entity.createdAt,

      // * берем из entity
      passwordHash: entity.passwordHash,

      emailConfirmation: {
        confirmationCode: entity.emailConfirmation.confirmationCode,
        expirationDate: entity.emailConfirmation.expirationDate,
        isConfirmed: entity.emailConfirmation.isConfirmed,
      },

      recoveryPasswordInfo: entity.recoveryPasswordInfo ?? null,
    };
  }

  // * Domain -> Output
  static toViewModel(userDomain: UserEntity): UserOutput {
    return {
      id: userDomain.id.toString(),
      login: userDomain.login,
      email: userDomain.email,
      createdAt: userDomain.createdAt.toISOString(),
    };
  }

  // * Domain -> List Output
  static toViewModelList(
    meta: { pageNumber: number; pageSize: number; totalCount: number },
    usersDomain: UserEntity[]
  ): UsersListPaginatedOutput {
    return {
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      page: meta.pageNumber,
      pageSize: meta.pageSize,
      totalCount: meta.totalCount,

      items: usersDomain.map(
        (user): UserOutput => ({
          id: user.id.toString(),
          login: user.login,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        })
      ),
    };
  }
}
