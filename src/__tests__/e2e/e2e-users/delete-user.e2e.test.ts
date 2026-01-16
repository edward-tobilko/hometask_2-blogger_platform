import express from "express";
import request from "supertest";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { clearDB } from "__tests__/utils/clear-db";
import { createUserBodyDto } from "__tests__/utils/users/create-user.util";
import { getUserDto } from "__tests__/utils/users/get-user-dto.util";
import { deleteUser } from "__tests__/utils/users/delete-user.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { getUsersList } from "__tests__/utils/users/get-users-list.util";
import { routersPaths } from "@core/paths/paths";

describe("E2E delete user tests", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("should delete user and return status 204 ", async () => {
    const dto = getUserDto();

    // * create new user
    const user = await createUserBodyDto(app, dto);

    // * delete this user
    await deleteUser(app, user.id).expect(HTTP_STATUS_CODES.NO_CONTENT_204);

    // * verify that the user no longer exists
    const response = await getUsersList(app).expect(HTTP_STATUS_CODES.OK_200);

    expect(response.body.items).toEqual(
      expect.not.arrayContaining([expect.objectContaining({ id: user.id })])
    );
  });

  // * не авторизован
  it("should return status 401 without authorization", async () => {
    const dto = getUserDto();

    const user = await createUserBodyDto(app, dto);

    await request(app)
      .delete(`${routersPaths.users}/${user.id}`)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  // * если не существующий id
  it("should return status 404 if user does not exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    await deleteUser(app, fakeId).expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  // * если не валидный id
  it("should return status 404 for invalid id format", async () => {
    const invalidId = "invalid-id-123";

    await deleteUser(app, invalidId).expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });
});
