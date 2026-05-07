import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Server } from 'http';
import { Connection } from 'mongoose';

import { AppModule } from 'src/app.module';
import { NodeMailerService } from 'src/modules/user-accounts/infrastructure/external-services/mailer.external-service';
import { appSetup } from 'src/setup/app.setup';
import { EmailServiceMock } from 'test/mock/email-service.mock';
import { UsersTestManager } from './users-test-manager.helper';
import { deleteAllData } from './delete-all-date.helper';

export const initSettings = async (
  //* передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(NodeMailerService)
    .useClass(EmailServiceMock); // заменяем отправку письма на моковую заглушку, что бы письмо не уходило реально

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();

  appSetup(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer() as Server;
  const userTestManager = new UsersTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManager,
  };
};
