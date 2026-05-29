import { Injectable, Scope } from '@nestjs/common';

import { CounterRepository } from '../infrastructure/counter.repo';
import { LoggerService } from './logger.service';

@Injectable({ scope: Scope.DEFAULT })
export class CounterService {
  constructor(
    private counterRepository: CounterRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CounterService.name);

    console.log('CounterService creating');
  }

  getCountAndIncrement() {
    this.logger.log('message in getCountAndIncrement method');

    this.counterRepository.increment();

    return this.counterRepository.getCount();
  }
}
