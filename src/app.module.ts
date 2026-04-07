import { Module } from "@nestjs/common";

import { AppController } from "app.controller";
import { AppService } from "app.service";
import { BlogsController } from "blogs-nest/blogs.controller";

@Module({
  imports: [],

  controllers: [AppController, BlogsController],
  providers: [AppService],
})
export class AppModule {}
