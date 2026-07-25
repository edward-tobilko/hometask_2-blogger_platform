import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { CoreConfig } from './core.config';

@Global()
@Module({
  imports: [ConfigModule, CqrsModule],

  providers: [CoreConfig],

  exports: [CoreConfig, CqrsModule],
})
export class CoreModule {}
