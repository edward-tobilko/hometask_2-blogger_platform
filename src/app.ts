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
  getUsersController,
  initCompositionRoot,
} from "composition-root";

import { testingRoute } from "./testing/routes/testing.route";
import { createPostsRouter } from "./posts/routes/posts.route";
import { routersPaths } from "./core/paths/paths";
import { createAuthRouter } from "./auth/routes/auth.route";
import { createCommentsRouter } from "./comments/routes/comments.route";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createUsersRouter } from "users/routes/users.route";
import { createBlogsRouter } from "blogs/routes/blogs.route";
import { createSecurityDevicesRouter } from "security-devices/routers/security-devices.router";

export const setupApp = (app: Express) => {
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1); // for prod
  } else {
    app.set("trust proxy", false); // for dev/test
  }

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

  // * Root router
  app.get(routersPaths.root, (_req: Request, res: Response) => {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello User");
  });

  // * Auth router
  app.use(
    routersPaths.auth,

    createAuthRouter(customRateLimitRepo, authController, jwtService)
  );

  // * Blogs router
  app.use(routersPaths.blogs, createBlogsRouter(blogsController));

  // * Comments router
  app.use(
    routersPaths.comments,

    createCommentsRouter(commentsController, jwtService)
  );

  // * Posts router
  app.use(
    routersPaths.posts,

    createPostsRouter(postsController, blogsQueryService, jwtService)
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
