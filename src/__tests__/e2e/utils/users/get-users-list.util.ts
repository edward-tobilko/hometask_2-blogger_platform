import request from "supertest";
import { Express } from "express";

import { routersPaths } from "@core/paths/paths";
import { generateBasicAuthToken } from "../generate-admin-auth-token";
import { UsersListRP } from "users/routes/request-payload-types/get-users-list.request-payload-types";
import { UserSortFieldRP } from "users/routes/request-payload-types/user-sort-field.request-payload-types";
import { SortDirections } from "@core/types/sort-directions.enum";

export function getUsersList(
  app: Express,
  optional: { query?: Partial<UsersListRP> } = {}
) {
  const { query } = optional;

  const defaultQuery: UsersListRP = {
    sortBy: UserSortFieldRP.CreatedAt,
    sortDirection: SortDirections.DESC,
    pageNumber: 1,
    pageSize: 10,

    ...query,
  };

  const usersList = request(app)
    .get(routersPaths.users)
    .set("Authorization", generateBasicAuthToken())
    .query(defaultQuery);

  return usersList;
}
