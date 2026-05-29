import { Injectable, Scope } from '@nestjs/common';

import { CounterRepository } from '../infrastructure/counter.repo';

@Injectable({ scope: Scope.DEFAULT })
export class Counter2Service {
  constructor(private counterRepository: CounterRepository) {
    console.log('Counter2Service creating');
  }

  getCountAndIncrement() {
    this.counterRepository.increment();

    return this.counterRepository.getCount();
  }
}
