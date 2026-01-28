import express from "express";
import request from "supertest";

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
  securityDevicesPath,
} from "../utils/security-devices/get-security-devices.util";
import { deleteSecurityDeviceById } from "../utils/security-devices/delete-security-device.util";
import { setAuthRefreshToken } from "../utils/auth/auth-refresh-token.util";
import { setAuthLogout } from "../utils/auth/auth-logout.util";

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

  describe("Check status codes - 401, 403, 404", () => {
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

  describe("Update refreshToken device 1", () => {
    let oldDevice1Data: ISecurityDevicesTest;
    let newDevice1RefreshToken: string;

    it("Get initial data Device 1", async () => {
      const res = await getSecurityDevices(app, devices.device1.cookies);

      oldDevice1Data = res.find((device: ISecurityDevicesTest) =>
        /Chrome/i.test(device.title)
      ) as ISecurityDevicesTest;

      expect(oldDevice1Data).toBeDefined();
      expect(oldDevice1Data.title).toMatch(/Chrome/i);
    });

    it("Update refreshToken Device 1", async () => {
      // * Ждем 1сек, чтобы lastActiveDate точно изменилась
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await setAuthRefreshToken(
        app,
        devices.device1.cookies
      ).expect(HTTP_STATUS_CODES.OK_200);

      // * Обновляем данные Device 1
      devices.device1.accessToken = response.body.accessToken;

      const setCookie = response.headers["set-cookie"];
      const cookiesArray = Array.isArray(setCookie)
        ? setCookie
        : setCookie
          ? [setCookie]
          : [];

      const refreshTokenCookie = cookiesArray.find((cookie: string) =>
        cookie.startsWith("refreshToken=")
      );

      newDevice1RefreshToken =
        refreshTokenCookie?.split(";")[0].replace("refreshToken=", "") || "";

      const cookieHeader = cookiesArray
        .map((cookie) => cookie.split(";")[0])
        .join("; ");
      devices.device1.cookies = cookieHeader;

      expect(newDevice1RefreshToken).toBeDefined();
      expect(newDevice1RefreshToken).not.toBe(devices.device1.refreshToken);

      devices.device1.refreshToken = newDevice1RefreshToken;
    });

    it("Check that the number of devices has not changed and check that deviceId Device 1 has not changed and check that lastActiveDate Device 1 was updated and check that all other deviceId have not changed", async () => {
      const response = await getSecurityDevices(app, devices.device1.cookies);

      const updatedDevice1 = response.find((device: ISecurityDevicesTest) =>
        /Chrome/i.test(device.title)
      );

      if (!updatedDevice1) {
        throw new Error("Device Chrome not found");
      }

      const deviceIds = response.map(
        (device: ISecurityDevicesTest) => device.deviceId
      );

      //*  DeviceId должен быть уникальным для каждого девайса
      const uniqueIds = new Set(deviceIds);

      expect(response).toHaveLength(4);
      expect(updatedDevice1.deviceId).toBe(oldDevice1Data.deviceId);
      expect(new Date(updatedDevice1.lastActiveDate).getTime()).toBeGreaterThan(
        new Date(oldDevice1Data.lastActiveDate).getTime()
      );
      expect(uniqueIds.size).toBe(4);
    });
  });

  describe("Removing Device 2", () => {
    let device2Id: string;

    it("Get deviceId Device 2", async () => {
      const listRes = await getSecurityDevices(app, devices.device1.cookies);

      const device2 = listRes.find((device: ISecurityDevicesTest) =>
        /Firefox/i.test(device.title)
      );

      if (!device2) throw new Error("Device Firefox not found");

      device2Id = device2.deviceId;

      expect(device2Id).toEqual(expect.any(String));
    });

    it("Remove Device 2 from Device 1", async () => {
      await deleteSecurityDeviceById(
        app,
        device2Id,
        devices.device1.cookies
      ).expect(HTTP_STATUS_CODES.NO_CONTENT_204);
    });

    it("Check if Device 2 is missing in list", async () => {
      const listRes = await getSecurityDevices(app, devices.device1.cookies);

      expect(listRes).toHaveLength(3);

      const deviceNames = listRes
        .map((device: ISecurityDevicesTest) => device.title)
        .join(" | ");

      expect(deviceNames).not.toMatch(/Firefox/i);
      expect(deviceNames).toMatch(/Chrome/i);
      expect(deviceNames).toMatch(/Safari/i);
      expect(deviceNames).toMatch(/Edge/i);
    });

    it("Check Device 2 cannot makes requests", async () => {
      await request(app)
        .get(securityDevicesPath)
        .set("Cookie", devices.device2.cookies)
        .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    });
  });

  describe("Logout Device 3", () => {
    it("Doing logout Device 3", async () => {
      await setAuthLogout(app, devices.device3.cookies).expect(
        HTTP_STATUS_CODES.NO_CONTENT_204
      );
    });

    it("Get device's list from Device 1", async () => {
      const listRes = await getSecurityDevices(app, devices.device1.cookies);

      expect(listRes).toHaveLength(2);

      const deviceNames = listRes
        .map((device: ISecurityDevicesTest) => device.title)
        .join(" | ");

      expect(deviceNames).not.toMatch(/Safari/i);
      expect(deviceNames).toMatch(/Chrome/i);
      expect(deviceNames).toMatch(/Edge/i);
    });

    it("Check Device 3 cannot makes requests", async () => {
      await request(app)
        .get(securityDevicesPath)
        .set("Cookie", devices.device3.cookies)
        .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    });
  });

  describe("Removing all other devices except Device 1", () => {
    it("Remove all devices except current (Device 1)", async () => {
      await request(app)
        .delete(securityDevicesPath)
        .set("Cookie", devices.device1.cookies)
        .expect(HTTP_STATUS_CODES.NO_CONTENT_204);
    });

    it("Check that Device 1 is only", async () => {
      const listRes = await getSecurityDevices(app, devices.device1.cookies);

      expect(listRes).toHaveLength(1);
      expect(listRes[0].title).toMatch(/Chrome/i);
    });

    it("Check that Device 4 can no longer make requests", async () => {
      await request(app)
        .get(securityDevicesPath)
        .set("Cookie", devices.device4.cookies)
        .expect(HTTP_STATUS_CODES.UNAUTHORIZED_401);
    });

    it("Device 1 still can makes requests", async () => {
      await getSecurityDevices(app, devices.device1.cookies);
    });
  });
});

// ? Рекомендации по тестированию:

// ? - Создаем пользователя, логиним пользователя 4 раза с разныными user-agent;
// ? - Делаем проверки на ошибки 404, 401, 403;
// ? - Обновляем refreshToken девайса 1;
// ? - Запрашиваем список девайсов с обновленным токеном. Количество девайсов и deviceId  всех девайсов не должны измениться. LastActiveDate девайса 1 должна измениться;
// ? - Удаляем девайс 2 (передаем refreshToken девайса 1). Запрашиваем список девайсов. Проверяем, что девайс 2 отсутствует в списке;
// ? - Делаем logout девайсом 3. Запрашиваем список девайсов (девайсом 1).  В списке не должно быть девайса 3;
// ? - Удаляем все оставшиеся девайсы (девайсом 1).  Запрашиваем список девайсов. В списке должен содержаться только один (текущий) девайс;
