import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Server } from 'http';
import { Connection } from 'mongoose';
import { getOptionsToken } from '@nestjs/throttler';

import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';
import { appSetup } from 'src/setup/app.setup';
import { EmailServiceMock } from 'test/mock/email-service.mock';
import { UserTestManager } from './users-test-manager.helper';
import { deleteAllData } from './delete-all-date.helper';
import {
  UserAccount,
  UserAccountDocument,
} from 'src/modules/user-accounts/domain/entities/user.entity';
import { BlogTestManager } from './blogs-test-manager.helper';
import {
  Blog,
  BlogDocument,
} from 'src/modules/bloggers-platform/blogs/domain/entities/blog.entity';
import {
  Post,
  PostDocument,
} from 'src/modules/bloggers-platform/posts/domain/entities/post.entity';
import { PostTestManager } from './posts-test-manager.helper';
import {
  Comment,
  CommentDocument,
} from 'src/modules/bloggers-platform/comments/domain/entities/comment.entity';
import { CommentTestManager } from './comments-test-manager.helper';
import { initAppModule } from 'src/init-app.module';
import { CoreConfig } from 'src/core/core.config';
import {
  SecurityDevices,
  SecurityDevicesDocument,
} from 'src/modules/user-accounts/domain/entities/security-devices.entity';
import { SecurityDevicesTestManager } from './security-devices-test-manager.helper';

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

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer() as Server;

  const UserModel = databaseConnection.model<UserAccountDocument>(
    UserAccount.name,
  );
  databaseConnection.model<BlogDocument>(Blog.name);
  databaseConnection.model<PostDocument>(Post.name);
  databaseConnection.model<CommentDocument>(Comment.name);
  databaseConnection.model<SecurityDevicesDocument>(SecurityDevices.name);

  const userTestManager = new UserTestManager(app, UserModel);
  const postTestManager = new PostTestManager(app);
  const blogTestManager = new BlogTestManager(app, postTestManager);
  const commentTestManager = new CommentTestManager(app);
  const securityDevicesTestManager = new SecurityDevicesTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManager,
    blogTestManager,
    postTestManager,
    commentTestManager,
    securityDevicesTestManager,
  };
};

// ? initSettings - Создаёт и запускает настоящее NestJS приложение для E2E тестов.
// ? .overrideProvider() - значит, что мы инжектим что то фейковое (перезатираем реальную логику)
