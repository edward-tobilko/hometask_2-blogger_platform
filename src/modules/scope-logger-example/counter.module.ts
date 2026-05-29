import { Module } from '@nestjs/common';

import { CounterController } from './api/counter.controller';
import { CounterRepository } from './infrastructure/counter.repo';
import { CounterService } from './application/counter.service';
import { Counter2Service } from './application/counter2.service';
import { LoggerService } from './application/logger.service';

@Module({
  controllers: [CounterController],
  providers: [
    CounterRepository,
    CounterService,
    Counter2Service,
    LoggerService,
  ],
})
export class CounterModule {}
