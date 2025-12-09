import { ObjectId } from "mongodb";

import { userCollection } from "../../db/mongo.db";
import { mapToUsersListOutput } from "../applications/mappers/map-to-users-list-output.mapper";
import { UsersListPaginatedOutput } from "../applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "../applications/query-handlers/get-users-list.query-handler";
import { UserDomain } from "../domain/user.domain";

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
