import express from "express";

import { getUserAgents } from "../utils/security-devices/get-user-agents.util";
import { getUserDto } from "../utils/users/get-user-dto.util";
import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { appConfig } from "@core/settings/config";
// import { clearDB } from "../utils/clear-db";
import { createUserBodyDto } from "../utils/users/create-user.util";
import { createAuthLogin } from "../utils/auth/auth-login.util";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import {
  getSecurityDevices,
  ISecurityDevicesTest,
} from "../utils/security-devices/get-security-devices.util";

// * Сохраняем данные для 4 устройств
export const devices = {
  device1: { refreshToken: "", accessToken: "", cookies: "" },
  device2: { refreshToken: "", accessToken: "", cookies: "" },
  device3: { refreshToken: "", accessToken: "", cookies: "" },
  device4: { refreshToken: "", accessToken: "", cookies: "" },
};

describe("Security Devices E2E Tests", () => {
  const app = express();
  setupApp(app);

  let createdUserId: string;

  const userCredentials = getUserDto();

  // * User-Agent'ы для разных устройств
  const userAgents = getUserAgents;

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    // await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });

  it("Create user and setup 4 logins", async () => {
    const response = await createUserBodyDto(app, {
      login: userCredentials.login,
      email: userCredentials.email,
      password: userCredentials.password,
    });

    createdUserId = response.id;

    expect(createdUserId).toBeDefined();
  });

  it("Login device-1 = Chrome", async () => {
    const res = await createAuthLogin(
      app,
      {
        loginOrEmail: userCredentials.login,
        password: userCredentials.password,
      },
      userAgents.chrome
    ).expect(HTTP_STATUS_CODES.OK_200);

    devices.device1.accessToken = res.body.accessToken;
    devices.device1.cookies = res.headers["set-cookie"];

    const cookiesArray = Array.isArray(devices.device1.cookies)
      ? devices.device1.cookies
      : devices.device1.cookies
        ? [devices.device1.cookies]
        : [];

    // *  Вытаскеваем refreshToken from cookie
    const refreshTokenFromCookie = cookiesArray.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );

    // * Преобразовуем куки-массив в строку
    const cookieHeader = cookiesArray.map((c) => c.split(";")[0]).join("; ");

    devices.device1.refreshToken =
      refreshTokenFromCookie?.split(";")[0].replace("refreshToken=", "") || "";
    devices.device1.cookies = cookieHeader;

    expect(devices.device1.accessToken).toBeDefined();
    expect(devices.device1.refreshToken).toBeDefined();
  });

  it("Login device-2 = FireFox", async () => {
    const res = await createAuthLogin(
      app,
      {
        loginOrEmail: userCredentials.login,
        password: userCredentials.password,
      },
      userAgents.firefox
    ).expect(HTTP_STATUS_CODES.OK_200);

    devices.device2.accessToken = res.body.accessToken;
    devices.device2.cookies = res.headers["set-cookie"];

    const cookiesArray = Array.isArray(devices.device2.cookies)
      ? devices.device2.cookies
      : devices.device2.cookies
        ? [devices.device2.cookies]
        : [];

    // *  Вытаскеваем refreshToken from cookie
    const refreshTokenFromCookie = cookiesArray.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );

    // * Преобразовуем куки-массив в строку
    const cookieHeader = cookiesArray.map((c) => c.split(";")[0]).join("; ");

    devices.device2.refreshToken =
      refreshTokenFromCookie?.split(";")[0].replace("refreshToken=", "") || "";
    devices.device2.cookies = cookieHeader;

    expect(devices.device2.accessToken).toBeDefined();
    expect(devices.device2.refreshToken).toBeDefined();
  });

  it("Login device-3 = Safari", async () => {
    const res = await createAuthLogin(
      app,
      {
        loginOrEmail: userCredentials.login,
        password: userCredentials.password,
      },
      userAgents.safari
    ).expect(HTTP_STATUS_CODES.OK_200);

    devices.device3.accessToken = res.body.accessToken;
    devices.device3.cookies = res.headers["set-cookie"];

    const cookiesArray = Array.isArray(devices.device3.cookies)
      ? devices.device3.cookies
      : devices.device3.cookies
        ? [devices.device3.cookies]
        : [];

    // *  Вытаскеваем refreshToken from cookie
    const refreshTokenFromCookie = cookiesArray.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );

    // * Преобразовуем куки-массив в строку
    const cookieHeader = cookiesArray.map((c) => c.split(";")[0]).join("; ");

    devices.device3.refreshToken =
      refreshTokenFromCookie?.split(";")[0].replace("refreshToken=", "") || "";
    devices.device3.cookies = cookieHeader;

    expect(devices.device3.accessToken).toBeDefined();
    expect(devices.device3.refreshToken).toBeDefined();
  });

  it("Login device-4 = Edge", async () => {
    const res = await createAuthLogin(
      app,
      {
        loginOrEmail: userCredentials.login,
        password: userCredentials.password,
      },
      userAgents.edge
    ).expect(HTTP_STATUS_CODES.OK_200);

    devices.device4.accessToken = res.body.accessToken;
    devices.device4.cookies = res.headers["set-cookie"];

    const cookiesArray = Array.isArray(devices.device4.cookies)
      ? devices.device4.cookies
      : devices.device4.cookies
        ? [devices.device4.cookies]
        : [];

    // *  Вытаскеваем refreshToken from cookie
    const refreshTokenFromCookie = cookiesArray.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );

    // * Преобразовуем куки-массив в строку
    const cookieHeader = cookiesArray.map((c) => c.split(";")[0]).join("; ");

    devices.device4.refreshToken =
      refreshTokenFromCookie?.split(";")[0].replace("refreshToken=", "") || "";
    devices.device4.cookies = cookieHeader;

    expect(devices.device4.accessToken).toBeDefined();
    expect(devices.device4.refreshToken).toBeDefined();
  });

  it("Check create 4 sessions", async () => {
    const devicesRes = await getSecurityDevices(app, devices.device1.cookies);

    expect(devicesRes).toHaveLength(4);

    console.log("devicesRes", devicesRes);

    const deviceNames = devicesRes.map(
      (device: ISecurityDevicesTest) => device.title
    );

    expect(deviceNames.join(" | ")).toMatch(/Chrome/i);
    expect(deviceNames.join(" | ")).toMatch(/Firefox/i);
    expect(deviceNames.join(" | ")).toMatch(/Safari/i);
    expect(deviceNames.join(" | ")).toMatch(/Edge/i);
  });
});
