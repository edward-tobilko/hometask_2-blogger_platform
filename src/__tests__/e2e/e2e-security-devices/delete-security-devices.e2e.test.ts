import express from "express";
import request from "supertest";

import { setupApp } from "app";
import {
  getSecurityDevices,
  securityDevicesPath,
} from "../utils/security-devices/get-security-devices.util";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { devices } from "./get-security-devices.e2e.test";
import { createUserBodyDto } from "../utils/users/create-user.util";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { deleteSecurityDeviceById } from "../utils/security-devices/delete-security-device.util";

describe("Check status codes - 401, 403, 404", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    // await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("GET: without refreshToken -> 401", async () => {
    await request(app)
      .get(securityDevicesPath)
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("GET: with invalid refreshToken -> 401", async () => {
    await request(app)
      .get(securityDevicesPath)
      .set("Cookie", "refreshToken=invalid-token")
      .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
  });

  it("DELETE: deviceId non-existent device -> 404", async () => {
    await deleteSecurityDeviceById(
      app,
      "00000000-0000-4000-8000-000000000000",
      devices.device1.cookies
    ).expect(HTTP_STATUS_CODES.NOT_FOUND_404);
  });

  it("DELETE: deviceId If try to delete the deviceId of other user -> 403", async () => {
    // * Create one other user
    const anotherUser = await createUserBodyDto(app);

    // * Login him
    const loginRes = await createAuthLogin(app, {
      loginOrEmail: anotherUser.login,
      password: "qwerty123", // look to getUserDto func
    }).expect(HTTP_STATUS_CODES.OK_200);

    const anotherUserCookie = loginRes.headers["set-cookie"];

    console.log("anotherUserCookie", anotherUserCookie);

    // * Try to remove the first user's device
    const devicesRes = await getSecurityDevices(app, devices.device1.cookies);

    const firstDeviceId = devicesRes[0].deviceId;

    // * Второй пользователь пытается удалить девайс первого
    await deleteSecurityDeviceById(
      app,
      firstDeviceId,
      anotherUserCookie
    ).expect(HTTP_STATUS_CODES.FORBIDDEN_403);
  });
});
