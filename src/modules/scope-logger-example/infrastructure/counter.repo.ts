import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class CounterRepository {
  count = 0;

  constructor() {
    console.log('CounterRepository creating');
  }

  increment() {
    this.count++;
  }

  getCount() {
    return this.count;
  }
}
