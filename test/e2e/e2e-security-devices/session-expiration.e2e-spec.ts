import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserAccountsConfig } from 'src/modules/user-accounts/config/user-accounts.config';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { delay } from 'test/helpers/delay.helper';
import { deleteAllData } from 'test/helpers/delete-all-date.helper';
import { initSettings } from 'test/helpers/init-settings.helper';
import { SecurityDevicesTestManager } from 'test/helpers/security-devices-test-manager.helper';
import { UserTestManager } from 'test/helpers/users-test-manager.helper';

describe('Security devices: session expiration', () => {
  let app: INestApplication;

  let userTestManager: UserTestManager;
  let securityDevicesTestManager: SecurityDevicesTestManager;

  const getRefreshCookie = (cookies: string[]) =>
    cookies.find((cookie) => cookie.startsWith('refreshToken='))!;

  const REFRESH_TOKEN_TTL = '3s'; // короткий срок жизни refresh-токена, чтобы не ждать час

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (config: UserAccountsConfig) =>
            new JwtService({
              secret: config.refreshTokenSecret,
              signOptions: {
                expiresIn: REFRESH_TOKEN_TTL,
              },
            }),

          inject: [UserAccountsConfig],
        }),
    );

    app = result.app;
    userTestManager = result.userTestManager;
    securityDevicesTestManager = result.securityDevicesTestManager;
  });

  afterAll(async () => await app.close());

  beforeEach(async () => await deleteAllData(app));

  it('Expired session is not returned in active devices list', async () => {
    const user = await userTestManager.getRegisteredAndConfirmedUser();
    const credentials = { loginOrEmail: user.login, password: user.password };

    await userTestManager.login(credentials); // сессия A

    await delay(3500); // сессия A истекла

    const loginB = await userTestManager.login(credentials); // сессия B — свежая

    const devices = await securityDevicesTestManager.getSecurityDevices(
      getRefreshCookie(loginB.cookies),
    );

    expect(devices).toHaveLength(1); // только B
  });

  it('Refresh-token extends session expiration', async () => {
    const user = await userTestManager.getRegisteredAndConfirmedUser();

    const login = await userTestManager.login({
      loginOrEmail: user.login,
      password: user.password,
    });

    await delay(2000);

    const refreshed = await userTestManager.getRefreshToken(
      getRefreshCookie(login.cookies),
    );

    await delay(1500); // срок от логина уже вышел, срок от refresh — ещё нет

    const devices = await securityDevicesTestManager.getSecurityDevices(
      getRefreshCookie(refreshed.cookies),
    );

    expect(devices).toHaveLength(1); // сессия жива, потому что refresh обновил expiresAt
  });
});
