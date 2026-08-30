import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ApiTags } from '@nestjs/swagger';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { ApiDeleteAllDataSwagger } from './delete-all-data-swagger.decorator';

@ApiTags('Testing')
@Controller(API_ROUTES.testing)
export class TestingDataController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @ApiDeleteAllDataSwagger('Clear database: delete all data from all tables')
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData(): Promise<void> {
    await this.dataSource.query(
      `TRUNCATE TABLE public.blogs, public.posts, public.security_devices_session, public.user_accounts RESTART IDENTITY CASCADE`,
    );
  }
}

// ? TRUNCATE — очистка таблицы (с сохранением структуры)
// ? RESTART IDENTITY - сбрасывает последовательности (sequence), если есть
// ? CASCADE - чистит зависимые таблицы
