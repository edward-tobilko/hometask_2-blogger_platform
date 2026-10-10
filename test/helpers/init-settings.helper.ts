import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Server } from 'http';
import { getOptionsToken } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';
import { appSetup } from 'src/setup/app.setup';
import { EmailServiceMock } from 'test/mock/email-service.mock';
import { UserTestManager } from './users-test-manager.helper';
import { deleteAllData } from './delete-all-date.helper';
import { BlogTestManager } from './blogs-test-manager.helper';
import { PostTestManager } from './posts-test-manager.helper';
import { CommentTestManager } from './comments-test-manager.helper';
import { initAppModule } from 'src/init-app.module';
import { CoreConfig } from 'src/core/core.config';
import { SecurityDevicesTestManager } from './security-devices-test-manager.helper';
import { UserAccountOrmEntity } from 'src/modules/user-accounts/infrastructure/sql/schemas/user-orm.entity';

export const initSettings = async (
  //* передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const dynamicAppModule = await initAppModule();

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [dynamicAppModule], // что бы тестировать РЕАЛЬНОЕ приложение — со всеми pipe, guard, filter
  })
    .overrideProvider(NodeMailerService)
    .useClass(EmailServiceMock) // заменяем отправку письма на моковую заглушку, что бы письмо не уходило реально
    .overrideProvider(getOptionsToken()) // ThrottlerGuard - читает настройки через DI токен 'THROTTLER:MODULE_OPTIONS' -> getOptionsToken() - возвращает строку 'THROTTLER:MODULE_OPTIONS'.
    .useValue([{ limit: 10000, ttl: 60000 }]); // что бы тесты не получали 429

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled); // применяем те же настройки что и в проде: global prefix /api, ValidationPipe, ExceptionFilter. Без этого тесты проверяли бы другое приложение, а не то что деплоится.

  await app.init();

  // * Connect SQL database
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(UserAccountOrmEntity);

  const httpServer = app.getHttpServer() as Server;

  const userTestManager = new UserTestManager(app, userRepo);
  const postTestManager = new PostTestManager(app);
  const blogTestManager = new BlogTestManager(app, postTestManager);
  const commentTestManager = new CommentTestManager(app);
  const securityDevicesTestManager = new SecurityDevicesTestManager(app);

  await deleteAllData(app);

  return {
    app,
    httpServer,
    userRepo,
    userTestManager,
    blogTestManager,
    postTestManager,
    commentTestManager,
    securityDevicesTestManager,
  };
};

// ? initSettings - Создаёт и запускает настоящее NestJS приложение для E2E тестов.
// ? .overrideProvider() - значит, что мы инжектим что то фейковое (перезатираем реальную логику)
