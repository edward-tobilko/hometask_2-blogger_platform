import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { SecurityDevicesTestManager } from 'test/helpers/security-devices-test-manager.helper';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';

describe('Security Devices swagger contract', () => {
  let app: INestApplication;
  let userTestManager: UserTestManager;
  let securityDevicesTestManager: SecurityDevicesTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: process.env.ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );

    app = result.app;
    userTestManager = result.userTestManager;
    securityDevicesTestManager = result.securityDevicesTestManager;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  describe('Tests for GET: /api/security/devices end-point -> Returns all devices with active sessions for current user', () => {
    it('status 200 - returns array of devices for current user', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();
      const loginResult = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      const cookie = loginResult.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;

      const devices =
        await securityDevicesTestManager.getSecurityDevices(cookie);

      expect(Array.isArray(devices)).toBe(true);
      expect(devices).toHaveLength(1);
      expect(devices[0]).toMatchObject({
        ip: expect.any(String),
        title: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      });
    });

    it('status 200 - multiple logins create multiple sessions', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });
      const login2 = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      const cookie = login2.cookies.find((c) => c.startsWith('refreshToken='))!;

      const devices =
        await securityDevicesTestManager.getSecurityDevices(cookie);

      expect(devices).toHaveLength(2);
    });

    it('status 401 - without refresh token', async () => {
      await securityDevicesTestManager.getSecurityDevices(
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 401 - with invalid refresh token', async () => {
      await securityDevicesTestManager.getSecurityDevices(
        'refreshToken=invalid',
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe("Tests for DELETE: /api/security/devices -> Terminate all other (exclude current) device's sessions", () => {
    it('status 204 - deletes all sessions except current', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });
      await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });
      const login3 = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      const cookie3 = login3.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;

      // * до удаления — 3 сессии
      const before =
        await securityDevicesTestManager.getSecurityDevices(cookie3);

      expect(before).toHaveLength(3);

      // * удаляем все кроме текущей (3-й)
      await securityDevicesTestManager.deleteAllSecurityDevicesExceptCurrent(
        cookie3,
      );

      // * осталась только текущая
      const after =
        await securityDevicesTestManager.getSecurityDevices(cookie3);

      expect(after).toHaveLength(1);
    });

    it('status 401 - without refresh token', async () => {
      await securityDevicesTestManager.deleteAllSecurityDevicesExceptCurrent(
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 401 - with invalid refresh token', async () => {
      await securityDevicesTestManager.deleteAllSecurityDevicesExceptCurrent(
        'refreshToken=invalid',
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('Tests for DELETE: /api/security/devices/:deviceId -> Terminate specified device session', () => {
    it('status 204 - successfully deletes specified session', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      // * два логина -> две сессии
      const login1 = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });
      const login2 = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      login1.cookies.find((c) => c.startsWith('refreshToken='))!;

      const cookie2 = login2.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;

      // * получаем сессии через вторую куку
      const devicesBefore =
        await securityDevicesTestManager.getSecurityDevices(cookie2);

      expect(devicesBefore).toHaveLength(2);

      await securityDevicesTestManager.deleteSecurityDeviceById(
        devicesBefore[0].deviceId,
        cookie2,
      );

      // * проверяем что осталась одна
      const devicesAfter =
        await securityDevicesTestManager.getSecurityDevices(cookie2);

      expect(devicesAfter).toHaveLength(1);
    });

    it('status 401 - without refresh token', async () => {
      await securityDevicesTestManager.deleteSecurityDeviceById(
        'some-uuid',
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('status 403 - if try to delete session of another user', async () => {
      const user1 = await userTestManager.getRegisteredAndConfirmedUser();
      const user2 = await userTestManager.getRegisteredAndConfirmedUser();

      const login1 = await userTestManager.login({
        loginOrEmail: user1.login,
        password: user1.password,
      });
      const login2 = await userTestManager.login({
        loginOrEmail: user2.login,
        password: user2.password,
      });

      const cookie1 = login1.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;
      const cookie2 = login2.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;

      // * получаем девайсы user1
      const user1Devices =
        await securityDevicesTestManager.getSecurityDevices(cookie1);

      // * user2 пытается удалить сессию user1 -> 403
      await securityDevicesTestManager.deleteSecurityDeviceById(
        user1Devices[0].deviceId,
        cookie2,
        HttpStatus.FORBIDDEN,
      );
    });

    it('status 404 - if deviceId not found', async () => {
      const user = await userTestManager.getRegisteredAndConfirmedUser();

      const loginResult = await userTestManager.login({
        loginOrEmail: user.login,
        password: user.password,
      });

      const cookie = loginResult.cookies.find((c) =>
        c.startsWith('refreshToken='),
      )!;

      const nonExistentDeviceId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      await securityDevicesTestManager.deleteSecurityDeviceById(
        nonExistentDeviceId,
        cookie,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
