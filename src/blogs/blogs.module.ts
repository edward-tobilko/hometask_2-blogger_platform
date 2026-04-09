import { Module } from '@nestjs/common';

import { BlogsController } from './blogs.controller';

@Module({
  controllers: [BlogsController],

  providers: [],
})
export class BlogsModule {}
