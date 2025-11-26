import { userCollection } from "../../db/mongo.db";
import { mapToUsersListOutput } from "../applications/mappers/map-to-users-list-output.mapper";
import { UsersListPaginatedOutput } from "../applications/output/users-list-paginated.output";
import { GetUsersListQueryHandler } from "../applications/query-handlers/get-users-list.query-handler";

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
        {
          login: { $regex: searchLoginTerm ?? "", $options: "i" },
          email: { $regex: searchEmailTerm ?? "", $options: "i" },
        },
      ],
    };

    const items = await userCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const totalCount = await userCollection.countDocuments(items);

    const usersListOutput = mapToUsersListOutput(items, {
      pageNumber,
      pageSize,
      totalCount,
    });

    return usersListOutput;
  }
}
