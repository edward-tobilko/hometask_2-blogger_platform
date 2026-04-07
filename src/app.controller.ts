import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";

import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { appConfig } from "@core/settings/config";

@Controller(routersPaths.root)
export class AppController {
  @Get() // декоратор (@) метода Get
  rootPage(@Res() response: Response) {
    response.status(HTTP_STATUS_CODES.OK_200).json({
      status: "ok",
      name: "Blogger Platform API",

      environment: appConfig.NODE_ENV,

      endpoints: {
        posts: "/api/posts",
        comments: "/api/comments",
        users: "/api/users",
        auth: "/api/auth",
      },

      timestamp: new Date().toISOString(),
    });
  }
}
