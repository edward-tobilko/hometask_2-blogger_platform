import { ObjectId } from "mongodb";

import { userCollection } from "../../db/mongo.db";
import { mapToUsersListOutput } from "../applications/mappers/map-to-users-list-output.mapper";
import { UsersListPaginatedOutput } from "../applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "../applications/query-handlers/get-users-list.query-handler";
import { UserDomain } from "../domain/user.domain";
import { UserOutput } from "../applications/output/user.output";
import { RepositoryNotFoundError } from "../../core/errors/repository-not-found.error";
import { mapToUserOutput } from "../applications/mappers/map-to-user-output.mapper";

export class UsersQueryRepository {
  async getUsersListQueryRepo(
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

    const filter = {
      $or: [
        { login: { $regex: searchLoginTerm ?? "", $options: "i" } },
        { email: { $regex: searchEmailTerm ?? "", $options: "i" } },
      ],
    };

    const items = await userCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await userCollection.countDocuments(filter);

    const usersListOutput = mapToUsersListOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return usersListOutput;
  }

  async findByLoginOrEmailQueryRepo(
    login?: string,
    email?: string
  ): Promise<UserDomain | null> {
    return userCollection.findOne({
      $or: [{ login }, { email }],
    });
  }

  async findUserByIdQueryRepo(id: string): Promise<UserDomain | null> {
    return await userCollection.findOne({ _id: new ObjectId(id) });
  }
}
