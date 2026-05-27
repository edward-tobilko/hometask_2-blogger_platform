import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { ApiDeleteAllDataSwagger } from './delete-all-data-swagger.decorator';

@Controller(API_ROUTES.testing)
export class TestingDataController {
  constructor(
    @InjectConnection() private readonly dataBaseConnection: Connection,
  ) {}

  @ApiDeleteAllDataSwagger(
    'Clear database: delete all data from all tables / collections',
  )
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData(): Promise<void> {
    // * Находим все коллекции в бд динамически
    const collections = await this.dataBaseConnection.listCollections();

    // * Чистим их параллельно (если создадим новую коллекцию — контроллер не надо трогать)
    const promises = collections.map((collection) =>
      this.dataBaseConnection.collection(collection.name).deleteMany({}),
    );

    await Promise.all(promises);
  }
}
