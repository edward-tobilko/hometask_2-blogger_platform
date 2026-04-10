import { Module } from '@nestjs/common';

import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  controllers: [BlogsController],

  providers: [BlogsService],

  exports: [BlogsService], // делаем сервис публичным "виден снаружи"
})
export class BlogsModule {}

// ? providers без exports — это private провайдеры, видимые только внутри своего модуля.
