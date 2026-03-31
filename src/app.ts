import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";

import {
  getAuthController,
  getBlogsController,
  getBlogsQueryService,
  getCommentsController,
  getCustomRateLimitRepo,
  getJwtService,
  getPostsController,
  getSecurityDevicesController,
  getSessionQueryRepo,
  getUsersController,
  initCompositionRoot,
} from "composition-root";

import { testingRoute } from "./testing/routes/testing.route";
import { createPostsRouter } from "./posts/presentation/controllers/posts.router";
import { routersPaths } from "./core/paths/paths";
import { createAuthRouter } from "./auth/presentation/routers/auth.route";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createSecurityDevicesRouter } from "security-devices/presentation/routers/security-devices.router";
import { appConfig } from "@core/settings/config";
import { createCommentsRouter } from "comments/presentation/controllers/comments.router";
import { createBlogsRouter } from "blogs/presentation/routes/blogs.route";
import { createUsersRouter } from "users/presentation/routes/users.route";

export const setupApp = (app: Express) => {
  app.set(
    "trust proxy",
    appConfig.NODE_ENV === "production" || appConfig.NODE_ENV === "test"
      ? 1
      : false
  );

  app.use(express.json());
  app.use(cookieParser());

  // * вызывать setupApp будем ПОСЛЕ runDB
  initCompositionRoot();

  // * получаем все getters только здесь (после init)
  const authController = getAuthController();
  const blogsController = getBlogsController();
  const commentsController = getCommentsController();
  const postsController = getPostsController();
  const securityDevicesController = getSecurityDevicesController();
  const usersController = getUsersController();
  const customRateLimitRepo = getCustomRateLimitRepo();
  const blogsQueryService = getBlogsQueryService();
  const jwtService = getJwtService();
  const sessionQueryRepository = getSessionQueryRepo();

  // * Root router
  app.get(routersPaths.root, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json({
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
  });

  // * Auth router
  app.use(
    routersPaths.auth,

    createAuthRouter(
      customRateLimitRepo,
      authController,
      jwtService,
      sessionQueryRepository
    )
  );

  // * Blogs router
  app.use(routersPaths.blogs, createBlogsRouter(blogsController, jwtService));

  // * Comments router
  app.use(
    routersPaths.comments,

    createCommentsRouter(commentsController, jwtService, sessionQueryRepository)
  );

  // * Posts router
  app.use(
    routersPaths.posts,

    createPostsRouter(
      postsController,
      blogsQueryService,
      jwtService,
      sessionQueryRepository
    )
  );

  // * Security devices router
  app.use(
    routersPaths.securityDevices,

    createSecurityDevicesRouter(securityDevicesController)
  );

  // * Users router
  app.use(routersPaths.users, createUsersRouter(usersController));

  // * Testing router
  app.use(routersPaths.testing, testingRoute);

  return app;
};

// ? DI (Dependency injection) - внедрение зависимостей. Нужны для:
// ? - гибкости: зависимости могут быть легко заменены на другие
// ? - легко тестировать (unit): легко внедрять моки вместо реальных зависимостей приложений.
// ? - соблюдение принципа инверсии зависимостей (Dependency Inversion Principle): Код становится зависимым от абстракций, а не от конкретных реализаций.

// ? IoC (Inversion of Control) Container - это объект который занимаеться управлением жизненным циклом других граф-зависимостей (как зависят объекты друг от друга (НЕ КЛАССЫ: UsersService ЗАВИСИТ ОТ UsersRepository, А ОБЪЕКТЫ: usersService ОТ usersRepo)).

// ? DI → Composition root → App → Router

//  ? Inversify
//  ?    ↓
//  ? container.get()
//  ?    ↓
//  ? composition-root.ts
//  ?    ↓
//  ? app.ts
//  ?    ↓
//  ? createAuthRouter(...)
//  ?    ↓
//  ? authController.method()
