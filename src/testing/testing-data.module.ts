import { Module } from '@nestjs/common';

import { TestingDataController } from './testing-data.controller';

@Module({
  imports: [],

  controllers: [TestingDataController],
})
export class TestingDataModule {}
