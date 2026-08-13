import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { CoreConfig } from './core.config';
import { TelegramAdapter } from './adapters/telegram.adapter';
import { typeOrmModule } from 'src/config/type-orm.module';

@Global()
@Module({
  imports: [ConfigModule, CqrsModule, HttpModule, typeOrmModule],

  providers: [CoreConfig, TelegramAdapter],

  exports: [CoreConfig, CqrsModule, TelegramAdapter],
})
export class CoreModule {}
